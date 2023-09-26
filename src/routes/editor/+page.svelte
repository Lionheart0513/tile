<script lang="ts">
    import { menu, selectedtile } from '../../stores';
    import Tile from '../../components/Tile.svelte';
    import Button from '../../components/Button.svelte';
	import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let components: any = [];

    function getTiles() {
        if(browser) {
            if(window.localStorage.getItem('1')) {
                const localObject = Object.keys(localStorage);
                localObject.forEach(key => {
                    if(/\d/.test(key)) {
                        components = [...components, {
                            component: Tile,
                            index: Number(key),
                            color: newColor()
                        }];
                    }
                })
                return;
            } else {
                components = [];
                return;
            };
        }
    }

    onMount(() => {
        getTiles();
    });

    $: {
        if(browser && $selectedtile.index > 0) {
            window.localStorage.setItem(`${$selectedtile.index}`, JSON.stringify($selectedtile));
        }
    }

    let tab: string;
    menu.subscribe(value => tab = value);

    interface Tile {
        index: number;
        width: number;
        inner: string;
        height: number;
        padding: number;
        margin: number;
        background: string;
        border: string;
        type: string;
    }

    function newColor() {
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        const scndColor = Math.floor(Math.random()*16777215).toString(16);
        
        if(randomColor !== "ffffff") {
            return `#${randomColor}`;
        } else return `#${scndColor}`;
        
    }

    function addTile() {
        components = [...components, {
            component: Tile,
            index: components.length + 1,
            color: newColor()
        }];

        let baseTile = {
            index: components.length,
            width: 250,
            inner: `Tile #${components.length}`,
            height: 250,
            padding: 0,
            margin: 0,
            background: "#fff",
            border: "none",
            type: "Tile"
        };

        if(browser) {
            window.localStorage.setItem(`${components.length}`, JSON.stringify(baseTile));
        }
    }

    function addButton() {
        components = [...components, {
            component: Button,
            index: components.length + 1
        }];
    }

    let page: HTMLElement;

    function closeMenu() {
        menu.set("closed")
        return tab;
    }

    let width: any = 250;
    let height: any = 250;
</script>

<div bind:this={page} class="page">
    <div class="tiles">
        {#each components as comp}
            <svelte:component subtile={false} this={comp.component} number={comp.index} color={comp.color} />
        {/each}
    </div>
    {#if tab === "tiles"}
    <div class="tab">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="row">
            <span on:click={closeMenu} class="material-symbols-outlined">
                close
            </span>
            <h2>Add Tiles</h2>
        </div>
        <div class="card">
            <img src="/tile1.png" alt="Tile 1">
            <button on:click={addTile} class="addTile">
                Add Tile
            </button>
        </div>
        <div class="card buttontile">
            <img src="/buttontile.png" alt="Tile 1">
            <button on:click={addButton} class="addTile">
                Add Tile
            </button>
        </div>
    </div>
    {/if}
    {#if tab === "settings"}
    <div class="tab">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="row">
            <span on:click={closeMenu} class="material-symbols-outlined">
                close
            </span>
            <h2>Settings</h2>
        </div>
    </div>
    {/if}
    {#if tab === "editor"}
    <div class="tab">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="column">
            <div class="row">
                <span on:click={closeMenu} class="material-symbols-outlined">
                    close
                </span>
                <h2>Tile Editor</h2>
            </div>
            {#if $selectedtile.index > 0}
            <div class="tile">
                <h2 style="font-size: 20px;">{$selectedtile.type} #{$selectedtile.index}</h2>
                <div style="flex-direction: column; align-items: center; justify-content: center; display: flex;">
                    <label for="height">Height</label>
                    <input bind:value={height} on:change={() => selectedtile.update((tile) => {tile.height = height; return tile;})} type="range" min="15" max="375" id="height">
                    <label for="width">Width</label>
                    <input bind:value={width} on:change={() => selectedtile.update((tile) => {tile.width = width; return tile;})} type="range" min="15" max="750" id="width">
                </div>
            </div>
            {/if}
        </div>
    </div>
{/if}
</div>

<style lang="scss">
    .row {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        width: max;
        height: max;
    }

    .column {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: max;
        height: max;
    }

    .material-symbols-outlined {
        font-size: 32px;
        cursor: pointer;
    }

    .page {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0;
        width: 100vw;
        height: calc(100vh - 100px);
        flex-direction: row;

        .tiles {
            height: calc(100vh - 100px);
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
        }
    }

    .tab {
        width: 361px;
        background: #252525;
        height: calc(100vh - 100px);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        z-index: 1;
        padding: 15px;
        gap: 25px;
        box-shadow: -4px 0px 8px rgba(0, 0, 0, 0.25);
        color: white;

        .card {
            width: 186px;
            height: 264px;
            background: #212121;
            border: 4px solid #FFFFFF;
            box-shadow: 7px 7px 0px rgba(255, 255, 255, 0.25);
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 21px;

            img {
                width: 150px;
                height: 150px;
            }

            .addTile {
                background: #252525;
                border: 4px solid #FFFFFF;
                box-shadow: 7px 7px 0px rgba(255, 255, 255, 0.25);
                border-radius: 9px;
                width: 150px;
                height: 52px;
                font-family: 'Montserrat';
                font-style: normal;
                font-weight: 600;
                font-size: 24px;
                line-height: 29px;
                color: white;
                cursor: pointer;
                transition: .3s linear;

                &:hover {
                    background: white;
                    color: #212121
                }
            }
        }

        .buttontile {
            width: 186px;
            height: 186px;

            img {
                width: 150px;
                height: 70px;
            }
        }
    }

    .tile {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
</style>