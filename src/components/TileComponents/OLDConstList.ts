export namespace RSLst {
	/*
      constID is a class representing a named value, which also had an ID related to its
      index (position) within an ordered list of like items.  constIDs are stored in
      constLists which are defined by a string in the format

      ListName|Element1Name:Desc e1|Element2Name: Description or value|...|ElementN:asdf|

      The last character in the constList string defines its Element Delimiter, in the
      case above, '|'.  The colon character ':' terminates the name (and cannot appear
      within the name), and each ElementNames may NOT start with a numeric character
      (0..9,-,+) since these are illegal in variable names.

      An element in the constList is starts and terminates with the Element Delimiter
      taking the format |ElementName:ElementDesc|.  Therefore, it is easy to search a
      constList for a particular Element by its name, in the form "|Element:".  The
      end of the Element is the last character before |.

      constLists can be used to maintain lists of defined constants for programmers, but
      conveniently provide a way to display those values to the user through their
      element names and descriptions.  (In such a case, their position in the list is
      fixed and provides the ID (index) value of the defined constant.  (See the ToDC
      function in the constID class).

      constLists and their defining string can also be used to provide configuration
      parameters for an object such as a Tile: e.g. |TileCfg|AL=UL|Color=Blue|Height=23|

      Because constLists and their constIDs are defined by strings, they can be used to
      pass data between machines or foreign tiles.  They can efficiently represent the
      data of diverse objects, e.g. user record
      "User|Name:Doe1234|FullName:John Doe:Email:scintillion@gmail.com|Value:123.96|Phone:16055551414|"

      Once passed to an object, a constList can be left AS IS, without deliberately
      parsing and expanding its data, because the individual elements are quickly
      accessed, each time as needed, using highly efficient string search.

      The constID for a list element returns the Name and Desc fields (strings),
      along with the ID (the index within the constList, which is fixed), and the
      Value field which is a number (if Desc is a number, Value will be set).

      A special case of a constList is a RefList, which is a list of indexes referring
      to a fully defined constList, with the form "constListName|1|5|23|" where the
      RefList includes elements #1, #5, #23 from the constList named "constListName".
      Note that if a constID is selected from the RefList, in this case, #2, it would
      select the second element in the list, whose name is "5".  Since there is no
      name terminator ':', we know this is a reflist element with no description field,
      but for consistency, we set the description field to match the name "5".  And the
      Value field for the constID is set to the numeric value of its name/descriptor = 5.

      By using a complete constList along with a RefList defining a subset of its
      elements, we can create lists of elements to display to the user.  The ToLine
      function of the constID creates such a line, with the Description in the first
      part of the line (readable by the user), and (if delimiter is provided), a
      second portion of the string defining the index/ID and the Name.

    */

	export const NameDelim = ':';
	export const PrimeDelim = '|';
	export const SecondDelim = '\t';
	export const LineDelim = '\n';
	export const FormatStart = '[';
	export const FormatEnd = ']';
	export const StrEndCh = '\f';

	const DDelim = '|';

	export enum CLType {
		None,
		Std,
		Name,
		ID,
		Pack
	}

	export function isDigit(ch: string): boolean {
		if (ch.length < 1) return false;

		if ((ch = ch[0]) <= '9') {
			return ch >= '0' || ch === '-';
		}
		return false;
	}

	function isDelim(ch: string): boolean {
		return ch == '|' || ch < ' ' || ch in ['~', '^', '\\'];
	}

	export function SplitStrs(Str: string, EndCh: string): string[] {
		let EndPos;
		let NextPos = 0;
		let Len = EndCh.length;
		let Trim = EndCh == '\n\n';
		let S: string;
		let Strs: string[] = [];

		while ((EndPos = Str.indexOf(StrEndCh, NextPos)) >= 0) {
			S = Str.substring(NextPos, EndPos);
			if (Trim) S = S.trim();
			if (S) Strs.concat(S);

			NextPos = EndPos + Len;
		}
		S = Str.substring(NextPos);
		if (Trim) S = S.trim();
		if (S) Strs.concat(S);

		return Strs;
	}

	export function FromString(Str: string) {
		let Strs = SplitStrs(Str, '\n');

		let limit = Strs.length;
		for (let i = 0; i < limit; ++i) {
			let Pos = Strs[i].indexOf('\t');
			if (Pos >= 0) Strs[i] = Strs[i].slice(0, Pos).trimEnd();
		}

		return Strs;
	}

	/*
	const TileStrings: string[] = [
		'T\ta|name:Full|\ts|row:1|\t',
		' T\ta|name:Top|\ts|bgColor:magenta|maxheight:100|\t',
		' T\ta|name:Bottom|\ts|flex:1|row:0|\t',
		'  T\ta|name:Left|\ts|bgColor:green|maxwidth: 100|\t',
		'  T\ta|name:Middle|\ts|bgColor:cyan|flex:1|\t',
		'  T\ta|name:Right|\ts|bgColor:yellow|maxwidth:100|\t'
	];
*/

const TileStrings: string[] = [
	'T\ta|name:Full|\ts|display:flex|flex-direction:column|align:center|justify:center|background:black|min-width:750px|max-width:750px|min-height:500px|\t',
	' T\ta|name:Top|\ts|background:magenta|min-height:150px|\t',
	'  T\ta|name:Left|\ts|background:green|min-width:100px|\t',
	'   T\ta|name:Top|\ts|background:magenta|min-height:50px|\t',
	'   T\ta|name:Bottom|\ts|background:magenta|min-height:100px|\t',
	'  T\ta|name:Right|\ts|background:cyan|width:100%|display:flex|\t',
	' T\ta|name:Bottom|\ts|display:flex|flex-direction:row|background:white|min-height:350px|\t',
	'  T\ta|name:Left|\ts|background:green|min-width:100px|\t',
	'  T\ta|name:Middle|\ts|background:cyan|width:100%|display:flex|\t',
	'  T\ta|name:Right|\ts|background:yellow|min-width:200px|\t',
];

	class TileID {
		tnum: number;
		vnum: number;
		tname: string;
		vname: string;
		_Str: string;

		constructor(Str: string) {
			Str = Str.trim();
			this._Str = Str;

			let NamEnd = Str.indexOf(NameDelim);
			if (NamEnd >= 0) {
				this.tname = Str.slice(0, NamEnd);
				this.vname = Str.slice(NamEnd + 1);
			} else {
				this.tname = Str;
				this.vname = '';
			}

			this.tnum = 0;
			this.vnum = 0;
		}

		Valid(): boolean {
			if (this.tnum) return true;
			else if (this.tname) return true;

			return false;
		}

		ToString(): string {
			if (this.vname) return this.tname + NameDelim + this.vname;
			return this.tname;
		}
	}

	export class TDE {
		//  TileDefElement, for defining Tiles
		level: number;
		tileID: TileID | undefined;
		List: constList | undefined;
		First: constList | undefined;
		nLists = 0;
		parent = 0;
		prev = 0;
		next = 0;
		first = 0;
		last = 0;

		constructor(Str: string) {
			this.List = new constList(Str);
			if (this.List) {
				let RawS = this.List.Raw();

				let limit = RawS.length; //ignore tailing ''
				for (let i = 0; i < limit; ++i) {
					let NewList = new constList(RawS[i], this.First);
					if (NewList) {
						++this.nLists;

						if (!this.First) this.First = NewList;
					}
				}
			}

			let i = 0;
			for (let limit = Str.length; i < limit && Str[i] <= '9'; ++i);

			let LevStr = Str.slice(0, i);

			this.level = Number(LevStr);
			if (!this.level) this.level = LevStr.length;

			let Pos = Str.indexOf(this.List.Delim, i);
			if (Pos > 0) this.tileID = new TileID(Str.slice(i, Pos));
		}
	}

	export class TileList {
		tiles: TDE[];

		constructor(Str: string[] | string) {
			let Strs: string[] = Array.isArray(Str) ? Str : FromString(Str);

			let count = 0;
			let limit = Strs.length + 1;

			this.tiles = Array(limit);
			for (let i = 0; ++i < limit; ) {
				console.log(i.toString() + '=' + Strs[i - 1]);

				if (Strs[i - 1][0] !== '!') {
					let newTDE = new TDE(Strs[i - 1]);
					if (newTDE) {
						this.tiles[++count] = newTDE;
					}
				}
			}

			this.tiles.length = count + 1;
			this.Links();
		}

		Links() {
			// calculate relations   for the TDEs
			let Tiles: TDE[] = this.tiles;
			let limit = Tiles.length;

			for (let tnum = 0; ++tnum < limit; ) {
				// each TDE/tile
				let i;

				let me = Tiles[tnum];
				let mylev = me.level;
				let parentlev = mylev - 1;
				let childlev = mylev + 1;
				let lev;

				me.first = me.next = me.parent = me.prev = 0;

				for (i = tnum; --i > 0; )
					if ((lev = Tiles[i].level) >= parentlev) {
						if (lev == parentlev) {
							me.parent = i;
							break;
						}
						else if ((lev == mylev)  &&  (!me.prev))
							me.prev = i;
					}

				for (i = me.last = tnum; ++i < limit; )
					if ((lev = Tiles[i].level) >= mylev) {
						if (lev === mylev) {
							me.next = i;
							break;
						}
						me.last = i;
						if ((lev == childlev) && !me.first)
							me.first = i;	// first child
					}
					else break;
			} // for each TDE/tile
		}

		ToString(): string {
			let Tiles = this.tiles;
			let limit = Tiles.length;
			let Str = '';

			for (let i = 0; ++i < limit; ) {
				let me = Tiles[i];

				let NewStr =
					(me.List ? me.List.Str : '@NOLIST@') +
					'\t' +
					i.toString() +
					'.level=' +
					me.level.toString() +
					' parent=' +
					me.parent.toString() +
					' prev=' +
					me.prev.toString() +
					' next=' +
					me.next.toString() +
					' first=' +
					me.first.toString() +
					' last=' +
					me.last.toString() +
					' #=' +
					(me.last - i + 1).toString() +
					' TileID=';

				if (me.tileID) NewStr += me.tileID.ToString();
				else NewStr += 'NONE';

				Str += NewStr + '\n';

				/*
                let List : constList|undefined = me.First;
                while (List)
                {
                    NewStr = '\t\t' + List.Name + '=' + List.Str;
                    Str += NewStr + '\n';
                    List = List.Next;
                }
    */
			}
			return Str;
		}

		ToSelect(Select: HTMLSelectElement) {
			let Tiles = this.tiles;
			let limit = Tiles.length;

			Select.options.length = 0;

			for (let i = 0; ++i < limit; ) {
				let Option: HTMLOptionElement = document.createElement('option') as HTMLOptionElement;

				let Tile = Tiles[i];
				let List = Tile.List;
				if (Tile && List && Tile.tileID) {
					let Str = '-----------------------------------------------------';
					Str = Str.slice(0, Tile.level * 3);
					Option.text = Str + i.toString() + '.' + Tile.tileID.ToString();
					//                  Option.value = this.ToExtraStr ();

					Option.setAttribute('name', 'N' + i.toString());
					let NameStr = Option.getAttribute('name');
					Option.style.color = 'pink';
					let ColorStr = Option.style.color;
					console.log('Option Name = ' + NameStr);
					console.log('Color = ', ColorStr);

					Select.options.add(Option);
				}
			}
		}
	}

	export class Plotter {
		// @ts-expect-error
		container: HTMLDivElement;
		list: TileList;

		constructor(List: TileList) {
			this.list = List;
		}

		PlotTiles() {
			this.list.tiles.forEach((tile, index) => {
				let HTMLTile = this.CreateTile(tile);
				if (!tile.parent) {
					this.container.append(HTMLTile);
				} else if (tile.parent) {
					let parent = this.container.querySelector(`#tile${tile.parent}`);
					if (parent) {
						parent.append(HTMLTile);
					}
				}
			});
		}

		CreateTile(tile: TDE) {
			let styles = ``;
			let index = this.list.tiles.indexOf(tile);
			const properties = tile.First?.Next?.IDsToCIDs(undefined);

			properties?.forEach((property) => {
				if (property.Name !== 'row' && property.Name !== 'column') {
					// @ts-ignore
					if (!isNaN(property.Desc)) {
						styles += `${property.Name}:${property.Desc}px;`;
					} else styles += `${property.Name}:${property.Desc};`;
				} else {
					// @ts-ignore
					if (tile.First?.Next?.GetNum(property.Name) === 1) {
						styles += `flex-direction:${property.Name};`;
					}
				}
			});

			let content = tile.First?.GetDesc("inner") !== undefined ? tile.First?.GetDesc("inner") : "";

			const HTMLTile = this.container.ownerDocument.createElement('div');
			HTMLTile.setAttribute('style', styles);
			HTMLTile.setAttribute('id', `tile${index}`);
			// @ts-ignore
			HTMLTile.innerText = content;

			return HTMLTile;
		}
	}

	export class TileCache {
		First: constList | undefined;

		constructor(ListStrs: string[]) {
			// 'Name:Addr|TileName1|..|TileNameN|"  ("*" is ALL)
			let limit = ListStrs.length;

			for (let i = 0; i < limit; ) {
				let Str = ListStrs[i++].trim();

				let List = new constList(Str, this.First);
				if (!this.First) this.First = List;
			}
		}

		LoadTile(ID: TileID) {}

		GetID(TileName: string): TileID | undefined {
			return undefined;
		}
	}

	export class IValue {
		_Str: string = '';
		Nums: number[] = [];
		Strs: string[] = [];
		Error: string = '';

		get Num(): number | undefined {
			return this.Nums && this.Nums.length === 1 ? this.Nums[0] : undefined;
		}
		get Str(): string | undefined {
			return this.Strs && this.Strs.length === 1 ? this.Strs[0] : undefined;
		}
	}

	export class IFmt {
		Type: number = 0;
		Ch = ''; // first char denoting type of format
		Str: string;
		Value: IValue = new IValue();
		Num = 0;
		List: constList | undefined;
		Arr: number[] | undefined;

		/*  Input Formats, defined by ]FormatStr[

            FormatStr starts with first character which defines its nature,
            followed by additional characters in some cases

            # - number (including floating point)
            I - integer
            Onn - ordinal integers, 0 allowed to indicate none (nn is limit if present)
            R - StartNumber  COMMA  EndNumber
            P - integer pair
            Ann - number array (COMMA separated)  (nn specifies size limit for array)
            {} - set of allowed strings inside brackets, choose one (or NONE)
            @ListName - choose member from named list
            $ - dollar amount, allows two digit cents included $$$.cc
            %nn - string limited to nn characters
            Unn - uppercase string




        */

		ParseValue(ValStr: string = '') {
			if (ValStr) {
				this.Value._Str = ValStr;
			} else ValStr = this.Value._Str;

			this.Value.Nums = [];
			this.Value.Strs = [];
			this.Value.Error = '';

			switch (this.Type) {
				case FMNum:
				case FMInt:
				case FMDollar:
				case FMRange:
				case FMOrd:
					this.Value.Nums.concat(Number(this.Value._Str));
					break; // single number

				case FMStrs:
					this.Value.Strs = SplitStrs(this.Value._Str, StrEndCh);
					break;

				case FMPair:
				case FMNums:
					let Strs = SplitStrs(this.Value._Str, ',');
					let limit = Strs.length;
					for (let i = 0; i < limit; ) this.Value.Nums.concat(Number(Strs[i++]));
					break; // multiple numbers

				case FMStr:
				case FMUpper:
				case FMSet:
					this.Value.Strs.concat(this.Value._Str);
					break; //  string

				default:
					this.Value.Error = 'Invalid Type';
					break;
			}
		}

		constructor(Str1: string) {
			let NoError = true;

			if (Str1[0] === FormatStart) Str1 = Str1.substring(1, Str1.length - 1); // clip the FormatCh  from the ends

			let V;
			let limit = Str1.length;

			for (let i = 0; ++i < limit; )
				if (Str1[i] === '=') {
					V = new IValue();
					V._Str = Str1.substring(i + 1);
					this.Value = V;
					Str1 = Str1.substring(0, i);
					break;
				}

			this.Str = Str1;

			this.Ch = Str1[0].toUpperCase();
			if (Str1.length > 1) {
				this.Str = Str1.substring(1);
				if (V) {
					if (isDigit(Str1[0])) this.Num = Number(Str1);
				}
			} else Str1 = '';

			let TypeArray = [
				FMNum,
				FMInt,
				FMDollar,
				FMPair,
				FMOrd,
				FMNums,
				FMStr,
				FMUpper,
				FMMember,
				FMRange,
				FMSet
			];

			let index = '#I$POA%U@R{'.indexOf(this.Ch);
			if (index >= 0) this.Type = TypeArray[index];

			switch (this.Type) {
				case FMNum:
				case FMInt:
				case FMPair:
					break;
				case FMOrd:
				case FMNums:
				case FMStr:
				case FMUpper:
					break;

				case FMMember:
					if (CL.First && !(this.List = CL.First.ListByName(Str1))) {
						this.Str = Str1 + ' = Bad List Name';
					}
					break;

				case FMRange:
					if (Str1.indexOf(',')) {
						this.Arr = new Array(2);
						this.Arr[0] = Number(Str1);
						this.Arr[1] = Number(Str1.substring(Str1.indexOf(',') + 1));
					} else this.Str = Str1 + ' = Bad Range';
					break;

				case FMSet:
					if (Str1[Str1.length - 1] === '}')
						Str1 = Str1.substring(1, Str1.length - 1); // clip it from ends
					else Str1 = Str1.substring(1);

					this.Str = Str1 = ',' + Str1 + ','; // every member starts/ends with ,
					break;

				default:
					this.Str = Str1 + ' = Bad String and Ch = ' + this.Ch;
					NoError = false;
			}

			if (NoError) this.ParseValue();
		}

		ToStr(): string {
			let RetStr = FormatStart + this.Ch + (this.Num ? this.Num.toString() : '');

			return RetStr + '=' + (this.Value ? '=' + this.Value : '') + FormatEnd;
		}
	}

	export class constID {
		// often abbreviated as CID
		Name: string;
		Desc: string;
		List: constList;
		Values: number[] = [];
		Fmt: IFmt | undefined;

		get ID(): number {
			return this.List ? this.List.IDByName(this.Name) : 0;
		}

		get Value(): number {
			return this.Values && this.Values.length === 1 ? this.Values[0] : 0;
		}

		constructor(Name1: string, Desc1: string, List1: constList) {
			this.Name = Name1;
			this.List = List1;

			if (Desc1) {
				if (Desc1[0] === FormatStart) {
					let limit = Desc1.length;

					for (let i = 0; ++i < limit; ) {
						if (Desc1[i] === FormatEnd) {
							this.Fmt = new IFmt(Desc1.substring(1, i));
							Desc1 = Desc1.substring(i + 1);
							break;
						}
					}
				}
			} else Desc1 = Name1;

			this.Desc = Desc1;

			if (isDigit(Desc1)) {
				if (Desc1.indexOf(',') < 0) {
					// single number
					this.Values.concat(Number(Desc1));
				} else {
					// array of numbers, comma separated
					let Strs = SplitStrs(Desc1, ',');
					let limit = Strs.length;

					for (let i = 0; i < limit; ) this.Values.concat(Number(Strs[i++]));
				}
			}
		}

		ToDC(Prefix: string): string {
			return Prefix + this.Name + '=' + this.ID.toString();
		}

		ToLine(Delim1: string = '') {
			if (Delim1) {
				return this.Desc + Delim1 + this.Name + NameDelim + this.ID.toString();
			} else return this.Desc;
		}

		ToStr(Delim = '|'): string {
			if (!this.Desc || this.Name === this.Desc) return this.Name;

			let RetStr = this.Name + NameDelim;
			if (this.Fmt) RetStr += this.Fmt.ToStr();

			return RetStr + this.Desc;
		}

		ToValueStr(): string {
			if (this.Fmt) {
				let Val = this.Fmt.Value;
				if (Val) {
					if (Val.Num) return '=' + Val.Num.toString();
					if (Val.Nums) return '=' + Val.Nums.toString();
					if (Val.Str) return '=' + Val.Str;
					if (Val.Strs) return '=' + Val.Strs.toString();
				}
			}
			return '';
		}

		ToFmtStr(): string {
			let Fmt = this.Fmt;
			if (Fmt) {
				let VStr = FormatStart + Fmt.Ch;

				if (Fmt.Num) VStr += Fmt.Num.toString();

				return VStr + this.ToValueStr() + FormatEnd;
			}
			return '';
		}

		ToExtraStr(): string {
			return this.ToFmtStr() + this.Name + ':' + this.ID.toString();
		}

		ToSelect(Select: HTMLSelectElement | undefined) {
			if (!Select) return;

			let Option: HTMLOptionElement = document.createElement('option') as HTMLOptionElement;

			Option.text = this.Desc;
			Option.value = this.ToExtraStr();
			Select.options.add(Option);
		}
	} // class constID

	export class constList {
		protected _Str = '';
		protected _Name = '';
		protected _Desc = '';
		protected _Delim = DDelim;
		private _FirstDelim = 0;
		protected _Count = 0;
		protected _NamePosQ: number[] = [];
		protected _Next: constList | undefined;
		protected _IDs: number[] = [];
		_NameIDs = '';
		Type: CLType = CLType.None;
		protected _FirstChild: constList | undefined;
		ListPack = false;

		get Count() {
			return this._Count;
		}
		get Str() {
			return this._Str;
		}
		get Name() {
			return this._Name;
		}
		get Desc() {
			return this._Desc;
		}
		get IDs(): constID[] | undefined {
			return this.IDs;
		} // only sensible for RefList, returns undefined if not
		get Next() {
			return this._Next;
		}
		get Delim() {
			return this._Delim;
		}
		get FirstChild() {
			return this._FirstChild;
		}

		Raw(): string[] {
			let NewStrs = this._Str.split(this._Delim);
			return NewStrs.slice(1, NewStrs.length);
		}

		Merge(AddList: constList | undefined): boolean {
			let DestStrs = this._Str.split(this._Delim);
			DestStrs.length = DestStrs.length - 1;
			let Destlimit = DestStrs.length;
			let Appended = 0;
			let Replaced = 0;

			console.log('Merging Dest:');

			for (let i = 0; i < Destlimit; ++i) console.log('Q1  ' + DestStrs[i]);

			if (!AddList) return false;

			let AddStrs = AddList._Str.split(AddList._Delim);

			let Addlimit = AddStrs.length - 1; // don't use last!
			console.log('Adding List');
			for (let i = 0; i < Addlimit; ++i) console.log('Q2  ' + AddStrs[i]);

			let NameD, Name;

			for (let i = 0; ++i < Addlimit; ) {
				let Pos = AddStrs[i].indexOf(NameDelim);
				let Replacer = Pos >= 0;
				Name = Replacer ? AddStrs[i].slice(0, Pos) : AddStrs[i];
				NameD = Name + NameDelim;

				for (let j = 0; ++j < Destlimit; ) {
					if (DestStrs[j].startsWith(Name)) {
						// at least partial match, is it full?
						if (DestStrs[j].startsWith(NameD) || DestStrs[j] == Name) {
							// TRUE match
							if (Replacer || DestStrs[j] == Name) {
								// need to replace
								console.log('Replacing with ' + AddStrs[i]);
								DestStrs[j] = AddStrs[i];
								++Replaced;
								Name = ''; // done, no more processing
							} else {
								Name = '';
								break; // TRUE match, not replaced, we are done
							}
						}
					}
				}

				// not found, need to add at end...
				if (Name) {
					// still active
					console.log('Appending ' + AddStrs[i]);
					++Appended;
					DestStrs.push(AddStrs[i]);
				}
			}

			if (Replaced || Appended) {
				let NewStr = DestStrs.join(this._Delim) + this._Delim;
				this.InitList(NewStr);
			}

			return false;
		}

		SetDelim(NewDelim: string): boolean {
			let OldDelim = this._Delim;

			if (!NewDelim || NewDelim.length != 1 || NewDelim == OldDelim || isDigit(NewDelim))
				return false;

			this._Str.replace(OldDelim, NewDelim);
			this._Delim = NewDelim;
			return true;
		}

		private CIDByPos(Pos1: number): constID | undefined {
			if (Pos1 < 0) return undefined;

			let EndPos = this._Str.indexOf(this._Delim, Pos1);
			if (EndPos >= 0) {
				let FoundStr = this._Str.substring(Pos1, EndPos);

				let limit = EndPos - Pos1;
				let NameEnd = 0;
				while (NameEnd < limit && FoundStr[NameEnd] != NameDelim) ++NameEnd;

				let NameStr;
				let DescStr;

				if (NameEnd < limit) {
					NameStr = FoundStr.substring(0, NameEnd);
					DescStr = FoundStr.substring(NameEnd + 1);
				} // Name:Desc found!
				else {
					NameStr = FoundStr;
					DescStr = '';
				}

				let NewCID = new constID(NameStr, DescStr, this);
				return NewCID;
			} else return undefined;
		}

		SortCIDs(CIDs: constID[]) {
			let limit = CIDs.length;
			var Temp: constID;

			for (let i = 0; ++i < limit; ) {
				for (let j = i; --j >= 0; ) {
					if (CIDs[j].Desc > CIDs[j + 1].Desc) {
						Temp = CIDs[j];
						CIDs[j] = CIDs[j + 1];
						CIDs[j + 1] = Temp;
					} else break;
				}
			}
		}

		ByIDs(IDs: number[], Sort: boolean = false): constID[] | undefined {
			if (!IDs) {
				// copy all in list
				let i = this._Count;
				IDs = new Array(i);
				while (--i >= 0) IDs[i] = i + 1;
			}

			let CIDs: constID[] = [];
			for (let i = IDs.length; --i >= 0; ) {
				let CID = this.GetCID(IDs[i]);
				if (CID) CIDs.concat(CID);
			}

			if (Sort) this.SortCIDs(CIDs);

			return CIDs;
		}

		NameList(UseList = 1): string {
			if (UseList && this._NameIDs) return this._NameIDs;

			let Str1 = this._Str;
			let Start = this._FirstDelim - 1;
			let Delim1 = this._Delim;
			let ID = 0;
			let NameStr = Delim1;

			while ((Start = Str1.indexOf(Delim1, Start)) >= 0) {
				let EndDelim = Str1.indexOf(Delim1, ++Start);
				if (EndDelim < 0) break;
				let NewStr = Str1.slice(Start, EndDelim);

				let EndName = NewStr.indexOf(NameDelim);
				if (EndName >= 0) NewStr = NewStr.slice(0, EndName);

				++ID;
				NameStr += NewStr + NameDelim + ID.toString() + Delim1;
			}

			this._NameIDs = NameStr;
			this._Count = ID;
			return NameStr;
		}

		IDByName(Name: string) {
			let Delim1 = this._Delim;
			let SearchStr = Delim1 + Name + NameDelim;
			let NameList = this.NameList();
			let Pos = NameList.indexOf(SearchStr);
			if (Pos >= 0) {
				let Start = Pos + SearchStr.length;
				let End = Start;
				let Str;

				while (NameList[++End] != Delim1);

				let Num = Number((Str = NameList.slice(Start, End)));
				if (isNaN(Num)) {
					console.log('QQQNameList 999 Str=' + Str + ' Name=' + Name + ' NameList=' + NameList);
					Num = 999;
				}
				return Num;
			}
			return 0;
		}

		NameByID(ID: number) {
			if (ID <= 0 || ID > this._Count) return '';

			let Str = this.NameList();
			let Delim1 = this._Delim;
			let SearchStr = ':' + ID.toString() + Delim1;
			let Pos = Str.indexOf(SearchStr);
			if (Pos >= 0) {
				let Start = Pos;
				while (Str[--Start] != Delim1);
				return Str.slice(Start + 1, Pos);
			}

			return '';
		}

		Dump(DumpStr: string) {
			console.log(DumpStr + 'Dump = ' + this._Str);
			let List = this._FirstChild;
			while (List) {
				List.Dump(DumpStr + '   ');
				List = List._Next;
			}
		}

		private InitList(Str1: string) {
			let Delim1 = Str1[Str1.length - 1];
			this._NameIDs = '';

			if (!isDelim(Delim1)) {
				let i = 0;
				let limit = Str1.length;
				while (i < limit)
					if (isDelim((Delim1 = Str1[i]))) {
						Str1 += Delim1;
						break;
					} else ++i;

				if (i >= limit) return; // panic, no Delim
			}

			this._FirstChild = undefined;

			let FoundTab = Str1.indexOf(SecondDelim);
			let FoundLine;
			if (FoundTab >= 0) {
				// handle sublists
				FoundLine = Str1.indexOf(LineDelim);
				let NewStr = Str1.trimEnd(); // elim all trailing delimiters and spaces
				let Start = FoundLine >= 0 ? 0 : 1;
				let NewStrs = NewStr.split(FoundLine >= 0 ? LineDelim : SecondDelim);

				// console.log ('Parent = ' + NewStr);

				for (let i = Start, limit = NewStrs.length; i < limit; ++i) {
					// console.log ('Line ' +i.toString () + '=' + NewStrs[i]);
					let NewList: constList = new constList(NewStrs[i], this._FirstChild);
					if (!this._FirstChild) this._FirstChild = NewList;
					// console.log (FoundLine ? 'FL' : 'FT', ' Child ' + i.toString () + '=' + NewList.Str);
				}
			}

			let FirstDelim = (this._FirstDelim = Str1.indexOf(Delim1));

			this._Str = Str1;

			let FirstChar = Str1[FirstDelim + 1];

			let IDList = isDigit(FirstChar);
			this.Type = IDList ? CLType.ID : CLType.Std;

			this._Name = Str1.substring(0, FirstDelim).trimStart();
			let i = this._Name.indexOf(NameDelim);
			if (i >= 0) {
				this._Desc = this._Name.substring(i + 1);
				this._Name = this._Name.substring(0, i);
			} else this._Desc = this._Name;

			if (this._Name == 'Ct') i = i;

			this._Delim = Delim1;
			// Note that delimiter is typically '|', placed at end of string, but \0 could
			// be used if one wished to allow '|' to appear within the const description

			if (IDList) {
				let N = 0;
				let limit = Str1.length - 1;
				let Pos: number[] = Array(99);
				Pos[0] = 0;

				for (let i = FirstDelim - 1; ++i < limit; ) {
					if (Str1[i] === Delim1) {
						Pos[++N] = Number(Str1.substring(i + 1, i + 25));
					}
				}
				this._Count = N;
				Pos.length = N + 1;
				this._IDs = Pos;
			}

			this.NameList();
		}

		constructor(Str1: string, First: constList | undefined = undefined) {
			this.InitList(Str1);

			if (First) {
				let Last = First;

				this._Next = undefined;

				while (Last._Next && Last._Next._Name != this._Name) Last = Last._Next;

				this._Next = Last._Next;
				Last._Next = this; // add our constList to the list of constLists
			}
		}

		ListByName(Name1: string): constList | undefined {
			let List: constList = this;
			while (List._Name != Name1) {
				if (List._Next) List = List._Next;
				else return undefined;
			}
			return List;
		}

		GetDesc(Name: string): string | undefined {
			let SearchStr = this._Delim + Name + NameDelim; // e.g. '|NameXYZ:''
			let Pos1 = this._Str.indexOf(SearchStr, this._FirstDelim);
			if (Pos1 > 0) {
				let StartPos = Pos1 + SearchStr.length;
				let EndPos = this._Str.indexOf(this._Delim, StartPos);

				if (EndPos > 0) return this._Str.slice(StartPos, EndPos);
			}
			return undefined;
		}

		GetNum(Name: string): number | undefined {
			let Str = this.GetDesc(Name);
			return Str ? Number(Str) : undefined;
		}

		GetStr(Name: string): string | undefined {
			let Str = this.GetDesc(Name);
			if (Str) {
				if (Str[0] === FormatStart) {
					let EndPos = Str.indexOf(FormatEnd, 1);

					if (EndPos > 0) return Str.slice(EndPos + 1);
				} else return Str;
			}
			return undefined;
		}

		UpdateCID(CID: constID, Delete = false) {
			if (!CID) return;

			let Delim = this._Delim;
			let Str = this._Str;

			let SearchStr = Delim + CID.Name;
			let Pos = Str.indexOf(SearchStr + Delim, this._FirstDelim);
			if (Pos < 0) {
				Pos = Str.indexOf(SearchStr + NameDelim, this._FirstDelim);
			}

			if (Pos >= 0) {
				let EndPos = Pos;

				while (Str[++EndPos] !== Delim);

				if (EndPos < Str.length - 1) {
					// not the last element in list!
					if (Delete) Str = Str.substring(0, Pos + 1);
					else Str = Str.substring(0, Pos + 1) + CID.ToStr() + Str.substring(EndPos);
				} else {
					if (Delete) Str = Str.substring(0, Pos + 1);
					Str = Str.substring(0, Pos + 1) + CID.ToStr() + Delim;
				}
			}

			this.InitList(Str);
		}

		GetCID(IDorName: string | number): constID | undefined {
			let SearchStr;

			if (typeof IDorName === 'number') SearchStr = this._Delim + this.NameByID(IDorName);
			else SearchStr = this._Delim + IDorName; // e.g. '|NameXYZ:''

			let Pos1 = this._Str.indexOf(SearchStr + NameDelim, this._FirstDelim);
			if (Pos1 < 0)
				// check for Name Only, no NameDelim |NameXYZ|
				Pos1 = this._Str.indexOf(SearchStr + this._Delim, this._FirstDelim);

			if (Pos1 >= 0) {
				// we found it
				return this.CIDByPos(Pos1 + 1);
			} else return undefined;
		}

		GetLine(ID: any, Delim1: string = ''): string {
			let CID: constID | undefined = this.GetCID(ID);
			return CID ? CID.ToLine(Delim1) : '';
		}

		IDsToRefList(IDs: number[]): constList | undefined {
			if (IDs) {
				let Delim = this._Delim;
				let Ret = this._Name + Delim;
				for (let i = IDs.length; --i >= 0; ) {
					Ret += IDs[i].toString() + Delim;
				}

				return new constList(Ret);
			}
			return undefined;
		}

		CIDsToRefList(CIDs: constID[] | undefined): constList | undefined {
			if (CIDs) {
				let IDs: number[] = new Array(CIDs.length);

				for (let i = CIDs.length; --i >= 0; ) {
					IDs[i] = CIDs[i].ID;
				}

				return this.IDsToRefList(IDs);
			} else return undefined;
		}

		IDsToCIDs(IDs: number[] | undefined): constID[] {
			if (!IDs) {
				// if undefined, use every element (IDs 1..N)
				let limit = this._Count;
				IDs = new Array(limit);
				for (let i = limit; --i >= 0; IDs[i] = i + 1);
			}

			let CIDs: constID[] = new Array(IDs.length);
			let CID: constID | undefined;

			for (let i = IDs.length; --i >= 0; ) {
				CID = this.GetCID(IDs[i]);
				if (CID) CIDs[i] = CID;
			}

			return CIDs;
		}

		ToSortedCIDs(): constID[] {
			let CIDs = this.IDsToCIDs(undefined);
			this.SortCIDs(CIDs);
			return CIDs;
		}

		RefListToCIDs(Ref: constList): constID[] | undefined {
			if (Ref._IDs) return this.IDsToCIDs(Ref._IDs);
			return undefined;
		}

		IDsToLines(IDs: number[], Delim: string): string[] {
			let i = IDs.length;
			let Lines: string[] = new Array(i);
			let CID: constID | undefined;

			while (--i >= 0) {
				CID = this.GetCID(IDs[i]);
				Lines[i] = CID ? CID.ToLine(Delim) : '';
			}

			return Lines;
		}

		CIDsToLines(CIDs: constID[], Delim: string): string[] {
			let i = CIDs.length;
			let Lines: string[] = new Array(i);

			while (--i >= 0) Lines[i] = CIDs[i].ToLine(Delim);

			return Lines;
		}

		ToDC(): string {
			let CIDs = this.ToSortedCIDs();
			let limit = CIDs.length;
			let FmtStr = '';

			let LineStr = '// ' + this._Name + NameDelim + this._Desc + '="' + this._Str + '"\n';
			let Line = 'export const ';
			for (let i = 0; i < limit; ++i) {
				Line += CIDs[i].ToDC(this._Name) + ',';

				let CID = CIDs[i];
				if (CID.Fmt) {
					// print out format
					FmtStr += '//\t' + CID.Name + ' ~' + CID.Fmt.Ch;

					if (CID.Fmt.Str) FmtStr += ' Str="' + CID.Fmt.Str + '"';

					if (CID.Fmt.Num) FmtStr += ' Num=' + CID.Fmt.Num.toString();

					if (CID.Fmt.Type) FmtStr += ' Type=' + CID.Fmt.Type.toString();

					FmtStr += '\n';
				}
			}

			Line = Line.substring(0, Line.length - 1) + ';';
			while (Line.length > 70) {
				let i = 70;
				while (--i && Line[i] !== ',');

				LineStr += Line.substring(0, ++i) + '\n\t';
				Line = Line.substring(i);
			}
			LineStr += Line + '\n';

			LineStr += FmtStr;

			return LineStr;
		}

		ToSelect(Select: HTMLSelectElement) {
			let CIDs = this.ToSortedCIDs();
			let limit = CIDs.length;

			Select.options.length = 0;
			for (let i = 0; i < limit; ) CIDs[i++].ToSelect(Select);
		}

		Download(filename: string, text: string) {
			var e = document.createElement('a');
			e.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
			e.setAttribute('download', filename);
			e.style.display = 'none';
			e.click();
		}
	} // constList

	export class IOType {
		type: number = 0;
		subTypes: number[] | undefined;
	}

	export class JxnDef {
		name: string = '';
		process: number = 0;
		Input: IOType | undefined;
		Output: IOType | undefined;
	}

	export class ListOfLists {
		First: constList | undefined;

		Add(ListStr: string | string[]): constList | undefined {
			if (typeof ListStr === 'string') {
				let NewList = new constList(ListStr as string, this.First);

				if (!this.First) this.First = NewList;

				return NewList;
			}

			// must be array!
			let ListStrs = ListStr as string[];
			let limit = ListStrs.length;

			for (let i = 0; i < limit; ) this.Add(ListStrs[i++]);

			return undefined;
		}

		Defines(FileName: string = 'Consts.ts') {
			let DocStr = '\n\n\n/*  Documentation Names/Desc\t___________________\n\n';

			let DefineStr = '/*\tDefines for ConstLists\t*/\n\n';

			let List: constList | undefined = this.First;
			while (List) {
				DefineStr += List.ToDC();
				DocStr += '\n\nList ' + List.Name + '(' + List.Desc + ')\t' + List.Str + '\n';
				let CIDs = List.ToSortedCIDs();
				for (let i = 0; i < CIDs.length; ++i) {
					let CID = CIDs[i];
					DocStr += CID.Name + '\t';
					if (CID.Fmt)
						DocStr +=
							'[' +
							CID.Fmt.Ch +
							(CID.Fmt.Num ? CID.Fmt.Num.toString() : '') +
							CID.Fmt.Str +
							']' +
							'\t';
					let ID = CID.List.IDByName(CID.Name); // CID.ID;
					// if (isNaN (ID))
					//   ID = 999;

					DocStr += CID.Desc + '\tID[' + CID.Name + ']==' + ID.toString() + '\n';
				}

				DocStr += 'NameList=' + List.NameList() + '\t' + List.Count + '\n';

				List = List.Next;
			}

			TL = new TileList(TileStrings);
			if (RSLst.LstEdit.TileSelect) TL.ToSelect(RSLst.LstEdit.TileSelect);

			let TString = TL.ToString();

			if (RSLst.CL.LT && RSLst.CL.AC) RSLst.CL.LT.Merge(RSLst.CL.AC);

			DocStr += '\n' + TString + '\n*/\n';

			DefineStr += DocStr;

			if (this.First) this.First.Download(FileName, DefineStr);

			let LongList = new constList(TileStrings.join('\n') + '\n');
			if (LongList) LongList.Dump('');
		}

		ToConstList(): constList | undefined {
			let List = this.First;
			if (!List) return undefined;

			let LStr = 'LL:ListOfLists|';

			while (List) {
				LStr += List.Name;
				if (List.Desc && List.Desc !== List.Name) LStr += NameDelim + List.Desc;
				LStr += '|';
				List = List.Next;
			}

			return new constList(LStr);
		}

		ToSelect(Select: HTMLSelectElement) {
			let List = this.ToConstList();

			if (List) List.ToSelect(Select);
		}
	}

	export function ConstPack(
		Name: string,
		Strs: string | string[],
		First: constList | undefined = undefined,
		NewDelim = '\t'
	): constList | undefined {
		let limit;
		let start;
		let S: string[];

		if (Array.isArray(Strs)) {
			S = Strs;
			limit = S.length;
			start = 0;
		} else {
			S = Strs.split('\n');
			start = 1;
			limit = S.length - 1;
		}

		let NewStr = Name + NewDelim;
		while (start < limit) {
			NewStr += S[start++] + NewDelim;
		}

		let NewList = new constList(NewStr, First);
		if (NewList) {
			NewList.ListPack = true;
			NewList.Type = CLType.Pack;
		}

		return NewList;
	}

	//  ________________________________________________

	export class RsLOL extends ListOfLists {
		FM = this.Add('FM|Num|Int|Dollar|Ord|Range|Pair|Nums|Member|Set|Str|Strs|Upper|');

		/*  Input Formats, defined by~FormatStr~

            FormatStr starts with first character which defines its nature,
            followed by additional characters in some cases

            # - number (including floating point)
            I - integer
            Onn - ordinal (+) integers, 0 allowed to indicate none (nn is limit if present)
            R - StartNumber  COMMA  EndNumber
            P - integer pair
            Ann - number array (COMMA separated)  (nn specifies size limit for array)
            {} - set of allowed strings inside brackets, choose one (or NONE)
            @ListName - choose member from named list
            $ - dollar amount, allows two digit cents included $$$.cc
            %nn - string limited to nn characters
            Unn - uppercase string
        */
		CT = this.Add('Ct:ConnectType|Data|Event|Action|Queue|DB|SQL:SQLite|Remote|Retail|');

		LT = this.Add(
			'Lt:ListType|Dt:DataType|Ev:Event|Ac:Action|Rt:Return|Td:TileDef|Ts:TileSize|Pr:Process|Mt:MessageType|Lg:Language|'
		);

		DT = this.Add(
			'Dt:DataType|String:Free format string|Integer:Whole Number|Number:Whole or Real Number|'
		);
		EV = this.Add('Ev:Event|Click|Enter|Exit|DblClick|Swipe|Drop|Drag|');
		RT = this.Add('Rt:Return|Ok|Fail|Equal|Unequal|Queue|');
		TD = this.Add('Td:TileDef|Tile|LnEdit|TxtEdit|Btn|Img|Video|');
		TS = this.Add(
			'Ts:TileSize|Fixed|T:Top|TL:Top Left|TR:Top Right|B:Bottom|BL:Bottom Left|BR:Bottom Right|L:Left|R:Right|SH:Shared|'
		);
		// Note that Tile Alignment is probably same as Tile Size, at least for now!
		Pr = this.Add('Pr:Process|Init|Read|Set|Clear|Default|');
		MT = this.Add('Mt:MessageType|Input|Output|Event|Trigger|Action|');
		AC = this.Add('Ac:Action|Init|Timer|Login|Logout|');
		LG = this.Add('Lg:Language|En:English|Es:Espanol|Cn:Chinese|');
		CY = this.Add('Cy:Country|US:United States|UK:United Kingdom|CA:Canada|RU:Russia|IN:India|');
		Test = this.Add('Test|NameF:~%12~First Name|XY:~P~XY Dim|Cost:~$~Dollar Price|');
	}

	export const CL = new RsLOL();

	export class LID {
		ListType: number;
		ID: number;
		Str: string = '';

		constructor(LT: number, ID1: number, Check = true) {
			this.ListType = LT;
			this.ID = ID1;

			if (Check) this.AsStr();
		}

		AsStr() {
			if (this.Str) return this.Str;
			if (!CL.First) return 'No Lists!';

			let RetStr = '';
			let Invalid = true;

			let ListCID: constID | undefined = CL.First.GetCID(this.ListType);
			if (ListCID) {
				let List: constList | undefined = CL.First.ListByName(ListCID.Name);

				if (List) {
					let CID: constID | undefined = List.GetCID(this.ID);

					RetStr = ListCID.Name + NameDelim + ListCID.Desc;

					if (CID) {
						RetStr += ' = ' + CID.Name + NameDelim + CID.Desc;
						Invalid = false;
					} else RetStr += ' = Bad ID #' + this.ID.toString();
				} else RetStr = 'Cannot find Listname ' + ListCID.Name + ' # ' + ListCID.ID.toString;
			} else RetStr = 'Bad List #' + this.ListType.toString();

			if (Invalid) {
				RetStr = '@' + RetStr;
				this.ListType = 0 - this.ListType;
				this.ID = 0 - this.ID;
				// consider breakpoint or error here!
			}

			return (this.Str = RetStr);
		}
	} // LID

	//  _____________________________________

	export class ListEdit {
		MainList: HTMLSelectElement | null | undefined;
		DropList: HTMLSelectElement | null | undefined;
		ListSelect: HTMLSelectElement | null | undefined;
		TileSelect: HTMLSelectElement | null | undefined;

		MainSelectedID: number = 0;
		ListSelectedID: number = 0;

		NameEdit: HTMLInputElement | null | undefined;
		FormatEdit: HTMLInputElement | null | undefined;
		ValueEdit: HTMLInputElement | null | undefined;
		DescEdit: HTMLInputElement | null | undefined;
	}

	export const LstEdit = new ListEdit();
	let TL: TileList;

	/*	Defines for ConstLists	*/

	// FM:FM="FM|Num|Int|Dollar|Ord|Range|Pair|Nums|Member|Set|Str|Strs|Upper|"
	export const FMDollar = 3,
		FMInt = 2,
		FMMember = 8,
		FMNum = 1,
		FMNums = 7,
		FMOrd = 4,
		FMPair = 6,
		FMRange = 5,
		FMSet = 9,
		FMStr = 10,
		FMStrs = 11,
		FMUpper = 12;
	// Ct:Country="Ct:Country|US:United States|UK:United Kingdom|Ca:Canada|Ru:Russia|In:India|"
	export const CtCa = 3,
		CtIn = 5,
		CtRu = 4,
		CtUK = 2,
		CtUS = 1;
	// Ct:ConnectType="Ct:ConnectType|Data|Event|Action|Queue|DB|SQL:SQLite|Remote|Retail|"
	export const CtAction = 3,
		CtDB = 5,
		CtData = 1,
		CtEvent = 2,
		CtQueue = 4,
		CtRemote = 7,
		CtRetail = 8,
		CtSQL = 6;
	// Lt:ListType="Lt:ListType|Dt:DataType|Ev:Event|Ac:Action|Rt:Return|Td:TileDef|Ts:TileSize|Pr:Process|Mt:MessageType|Lg:Language|"
	export const LtAc = 3,
		LtDt = 1,
		LtEv = 2,
		LtLg = 9,
		LtMt = 8,
		LtPr = 7,
		LtRt = 4,
		LtTd = 5,
		LtTs = 6;
	// Dt:DataType="Dt:DataType|String:Free format string|Integer:Whole Number|Number:Whole or Real Number|"
	export const DtString = 1,
		DtInteger = 2,
		DtNumber = 3;
	// Ev:Event="Ev:Event|Click|Enter|Exit|DblClick|Swipe|Drop|Drag|"
	export const EvClick = 1,
		EvDblClick = 4,
		EvDrag = 7,
		EvDrop = 6,
		EvEnter = 2,
		EvExit = 3,
		EvSwipe = 5;
	// Rt:Return="Rt:Return|Ok|Fail|Equal|Unequal|Queue|"
	export const RtEqual = 3,
		RtFail = 2,
		RtOk = 1,
		RtQueue = 5,
		RtUnequal = 4;
	// Td:TileDef="Td:TileDef|Tile|LnEdit|TxtEdit|Btn|Img|Video|"
	export const TdBtn = 4,
		TdImg = 5,
		TdLnEdit = 2,
		TdTile = 1,
		TdTxtEdit = 3,
		TdVideo = 6;
	// Ts:TileSize="Ts:TileSize|Fixed|T:Top|TL:Top Left|TR:Top Right|B:Bottom|BL:Bottom Left|BR:Bottom Right|L:Left|R:Right|SH:Shared|"
	export const TsB = 5,
		TsBL = 6,
		TsBR = 7,
		TsFixed = 1,
		TsL = 8,
		TsR = 9,
		TsSH = 10,
		TsT = 2,
		TsTL = 3,
		TsTR = 4;
	// Pr:Process="Pr:Process|Init|Read|Set|Clear|Default||"
	export const Pr = 6,
		PrClear = 4,
		PrDefault = 5,
		PrInit = 1,
		PrRead = 2,
		PrSet = 3;
	// Mt:MessageType="Mt:MessageType|Input|Output|Event|Trigger|Action|"
	export const MtAction = 5,
		MtEvent = 3,
		MtInput = 1,
		MtOutput = 2,
		MtTrigger = 4;
	// Ac:Action="Ac:Action|Init|Timer|Login|Logout|"
	export const AcInit = 1,
		AcLogin = 3,
		AcLogout = 4,
		AcTimer = 2;
	// Lg:Language="Lg:Language|En:English|Es:Espanol|Cn:Chinese|"
	export const LgCn = 3,
		LgEn = 1,
		LgEs = 2;
	// Test:Test="Test|NameF:~%12~First Name|XY:~P~XY Dim|Cost:~$~Dollar Price|"
	export const TestCost = 3,
		TestNameF = 1,
		TestXY = 2;
} // namespace RSLst

/*  Documentation Names/Desc	___________________



    List FM(FM)	FM|Num|Int|Dollar|Ord|Range|Pair|Nums|Member|Set|Str|Strs|Upper|
    Dollar	Dollar	ID3
    Int	Int	ID2
    Member	Member	ID8
    Num	Num	ID1
    Nums	Nums	ID7
    Ord	Ord	ID4
    Pair	Pair	ID6
    Range	Range	ID5
    Set	Set	ID9
    Str	Str	ID10
    Strs	Strs	ID11
    Upper	Upper	ID12


    List Ct(Country)	Ct:Country|US:United States|UK:United Kingdom|Ca:Canada|Ru:Russia|In:India|
    Ca	Canada	ID3
    In	India	ID5
    Ru	Russia	ID4
    UK	United Kingdom	ID2
    US	United States	ID1


    List Ct(ConnectType)	Ct:ConnectType|Data|Event|Action|Queue|DB|SQL:SQLite|Remote|Retail|
    Action	Action	ID3
    DB	DB	ID5
    Data	Data	ID1
    Event	Event	ID2
    Queue	Queue	ID4
    Remote	Remote	ID7
    Retail	Retail	ID8
    SQL	SQLite	ID6


    List Lt(ListType)	Lt:ListType|Dt:DataType|Ev:Event|Ac:Action|Rt:Return|Td:TileDef|Ts:TileSize|Pr:Process|Mt:MessageType|Lg:Language|
    Ac	Action	ID3
    Dt	DataType	ID1
    Ev	Event	ID2
    Lg	Language	ID9
    Mt	MessageType	ID8
    Pr	Process	ID7
    Rt	Return	ID4
    Td	TileDef	ID5
    Ts	TileSize	ID6


    List Dt(DataType)	Dt:DataType|String:Free format string|Integer:Whole Number|Number:Whole or Real Number|
    String	Free format string	ID1
    Integer	Whole Number	ID2
    Number	Whole or Real Number	ID3


    List Ev(Event)	Ev:Event|Click|Enter|Exit|DblClick|Swipe|Drop|Drag|
    Click	Click	ID1
    DblClick	DblClick	ID4
    Drag	Drag	ID7
    Drop	Drop	ID6
    Enter	Enter	ID2
    Exit	Exit	ID3
    Swipe	Swipe	ID5


    List Rt(Return)	Rt:Return|Ok|Fail|Equal|Unequal|Queue|
    Equal	Equal	ID3
    Fail	Fail	ID2
    Ok	Ok	ID1
    Queue	Queue	ID5
    Unequal	Unequal	ID4


    List Td(TileDef)	Td:TileDef|Tile|LnEdit|TxtEdit|Btn|Img|Video|
    Btn	Btn	ID4
    Img	Img	ID5
    LnEdit	LnEdit	ID2
    Tile	Tile	ID1
    TxtEdit	TxtEdit	ID3
    Video	Video	ID6


    List Ts(TileSize)	Ts:TileSize|Fixed|T:Top|TL:Top Left|TR:Top Right|B:Bottom|BL:Bottom Left|BR:Bottom Right|L:Left|R:Right|SH:Shared|
    B	Bottom	ID5
    BL	Bottom Left	ID6
    BR	Bottom Right	ID7
    Fixed	Fixed	ID1
    L	Left	ID8
    R	Right	ID9
    SH	Shared	ID10
    T	Top	ID2
    TL	Top Left	ID3
    TR	Top Right	ID4


    List Pr(Process)	Pr:Process|Init|Read|Set|Clear|Default||
            ID6
    Clear	Clear	ID4
    Default	Default	ID5
    Init	Init	ID1
    Read	Read	ID2
    Set	Set	ID3


    List Mt(MessageType)	Mt:MessageType|Input|Output|Event|Trigger|Action|
    Action	Action	ID5
    Event	Event	ID3
    Input	Input	ID1
    Output	Output	ID2
    Trigger	Trigger	ID4


    List Ac(Action)	Ac:Action|Init|Timer|Login|Logout|
    Init	Init	ID1
    Login	Login	ID3
    Logout	Logout	ID4
    Timer	Timer	ID2


    List Lg(Language)	Lg:Language|En:English|Es:Espanol|Cn:Chinese|
    Cn	Chinese	ID3
    En	English	ID1
    Es	Espanol	ID2


    List Test(Test)	Test|NameF:~%12~First Name|XY:~P~XY Dim|Cost:~$~Dollar Price|
    Cost	~$~Dollar Price	ID3
    NameF	~%12~First Name	ID1
    XY	~P~XY Dim	ID2

    */
