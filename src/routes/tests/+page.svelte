<script lang="ts">
	import { onMount } from "svelte";
    import { RSLst } from "../../components/TileComponents/ConstList";

    const TileStrings: string[] = [
		'T\ta|name:Full|\ts|display:flex|column:1|align-items:center|background:black|width:100vw|height:100vh|\t',
		' T\ta|name:Top|\ts|background:magenta|height:10vh|width:100vw|\t',
		' T\ta|name:Bottom|\ts|display:flex|row:1|background:none|align-items:center|justify-content:space-evenly|\t',
		'  T\ta|name:Left|inner:I am the left side|\ts|background:orange|width:20vw|height:90vh|\t',
		'  T\ta|name:Middle|inner:I am the middle|\ts|background:cyan|display:flex|width:60vw|height:90vh|\t',
		'  T\ta|name:Right|inner:I am the right side|\ts|background:yellow|width:20vw|height:90vh|\t'
	];

    const List: RSLst.TileList = new RSLst.TileList(TileStrings);
	const plotter: RSLst.Plotter = new RSLst.Plotter(List);

	onMount(() => {
		let tiles = document.querySelector(".tiles");
		if(tiles) {
			// @ts-expect-error
			plotter.container = tiles;
			plotter.PlotTiles();
		}
	})
</script>

<div class="tiles"></div>
