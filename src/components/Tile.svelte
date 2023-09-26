<script lang="ts">
    import H1 from './TileComponents/H1.svelte';
    //@ts-ignore
    import { selectedtile } from '../stores';
	import { browser } from '$app/environment';

    let dragTile: string;

    let menu: (HTMLDivElement);

    let tile: (HTMLElement);

    let self: any;

    export let number: number;
    export let color: string = "#fff";
    export let subtile: boolean;

    let selected;
    $: {
        selected = $selectedtile;
        if(browser) {
            self = (number === $selectedtile.index) ? $selectedtile : JSON.parse(window.localStorage.getItem(`${number}`));
        }
    }

    let bgColor: string;

    let subTiles: any[] = [];
    function createSubtile(c: string) {
        subTiles = [...subTiles, {
            number: subTiles.length + 1, 
            color: c,
            subtile: true
        }]
    }

    let alignItems: any = "center";
    let justifyContent: any = "center";
</script>
<!--on:dblclick={() => createSubtile("#000000")}-->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div style="background: {self.background}; height: {self.height}px; width: {self.width}px; margin: {self.margin}px; padding: {self.padding}px;" class="tile" bind:this={tile} on:click={() => selectedtile.set(self)} id={`tile${number}`}>
    <H1 defaultText={`Tile #${number}`}/>
    {#each subTiles as subtile}
        <svelte:self subtile={subtile.subtile} color={subtile.color} number={subtile.number}/>
    {/each}
</div>

<style lang="scss">
    .tile {
        width: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        height: 250px;
        background: white;
        color: black;
    }

    .subtile {
        width: 125px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 15px;
        height: 125px;
        background: rgb(191, 191, 191);
        color: black;
    }

    .menu {
        width: max-content;
        padding: 10px;
        display: none;
        justify-content: center;
        align-self: flex-start;
        flex-direction: column;
        height: max-content;
        background: rgba(0,0,0, 0.7);
        border-radius: 7px;
        box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.25);
        color: white;
        gap: 5px;
        font-size: 14px;

        button {
            outline: none;
            border: none;
            background: none;
            color: inherit;
            cursor: pointer;
            text-decoration: underline;
        }
    }
</style>