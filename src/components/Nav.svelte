<script lang="ts">
    import { get } from 'svelte/store';
    import { menu } from '../stores';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import SpaceTitle from './TileComponents/SpaceTitle.svelte';

    let t: HTMLSpanElement;
    let e: HTMLSpanElement;
    let s: HTMLSpanElement;

    let selectedMenu: string;
    menu.subscribe(value => {
        selectedMenu = value;
    });

    function setMenu(value: string) {
        menu.set(value);
        return selectedMenu;
    }
</script>
{#if $page.route.id?.startsWith("/editor")}
<nav>
    <div class="section1">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => goto('/')} class="material-symbols-outlined">
            arrow_back
        </span>
        <SpaceTitle defaultText="My Space #1"/>
        <span class="msg">
            — Editor
        </span>
    </div>
    <div class="section2">
        {#if selectedMenu === "tiles"}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={(e) => setMenu("tiles")} class="selected material-symbols-outlined">
            library_add
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("editor")} class="material-symbols-outlined">
            open_with
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("settings")} class="material-symbols-outlined">
            settings
        </span>
        {:else if selectedMenu === "editor"}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={(e) => setMenu("tiles")} class="material-symbols-outlined">
            library_add
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("editor")} class="selected material-symbols-outlined">
            open_with
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("settings")} class="material-symbols-outlined">
            settings
        </span>
        {:else if selectedMenu === "settings"}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={(e) => setMenu("tiles")} class="material-symbols-outlined">
            library_add
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("editor")} class="material-symbols-outlined">
            open_with
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("settings")} class="selected material-symbols-outlined">
            settings
        </span>
        {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={(e) => setMenu("tiles")} class="material-symbols-outlined">
            library_add
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("editor")} class="material-symbols-outlined">
            open_with
        </span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => setMenu("settings")} class="material-symbols-outlined">
            settings
        </span>
        {/if}
    </div>
</nav>
{:else if $page.route.id?.startsWith("/marko")}
<nav>
    <div class="section1">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => goto('/')} class="material-symbols-outlined">
            arrow_back
        </span>
        <SpaceTitle defaultText="Marko"/>
    </div>
    <div class="section2">
        <span on:click={() => goto("/editor/")} class="msg">Editor</span>
    </div>
</nav>
{:else}
<nav>
    <div class="section1">
        <span class="heading">
            Relational Spaces
        </span>
        <span class="msg">
            — Home
        </span>
    </div>
    <div class="section2">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => goto("/editor/")} class="msg">Editor</span>
    </div>
</nav>
{/if}

<style lang="scss">
    .material-symbols-outlined {
        font-size: 48px;
        cursor: pointer;
        transition: .3s linear;
    }

    .heading {
        font-family: 'Montserrat';
        font-style: normal;
        cursor: auto;
        font-weight: 800;
        font-size: 36px;
        line-height: 44px;         
        color: #FFFFFF;
    }

    .selected {
        color: #FFD700;
    }

    nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 2;
        padding-left: 25px;
        padding-right: 35px;
        width: 100vw;
        height: 100px;
        background: #252525;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25);

        .section1 {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            flex-direction: row;
            gap: 10px;

            .msg {
                font-family: 'Montserrat';
                font-style: normal;
                font-weight: 400;
                font-size: 36px;
                line-height: 44px;         
                color: #FFFFFF;
            }
        }

        .section2 {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 46px;
            flex-direction: row;

            .msg {
                font-family: 'Montserrat';
                font-style: normal;
                cursor: pointer;
                font-weight: 400;
                font-size: 36px;
                line-height: 44px;         
                color: #FFFFFF;
            }
        }
    }
</style>