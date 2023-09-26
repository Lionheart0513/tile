<svelte:head>
    <title>{title} | RS | v1.0.0</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        *{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Montserrat', sans-serif;
            overflow:hidden;
        }
    </style>
</svelte:head>

<script lang="ts">
    import Nav from '../components/Nav.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let title = "Home";

    if($page.route.id?.startsWith("/editor")) {
        title = "Editor"
    }
</script>

<div class="container">
    {#if $page.route.id?.startsWith("/tests")}
    <!--nothing here-->
    {:else}
    <Nav/>
    {/if}
    <div class="root" style="{$page.route.id?.startsWith("/tests") ? "width: 100vw; height: 100vh;":""}">
        <slot/>
    </div>
</div>

<style lang="scss">
    .container {
        display: flex;
        align-items: center;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        background: #1E1E1E;
        color: white;

        .root {
            width: 100vw;
            height: calc(100vh - 100px);
        }
    }
</style>