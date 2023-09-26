<script lang="ts">
    export let link: string;
    export let redirect: boolean;
    import Span from "./TileComponents/Span.svelte";
    import { draggable } from "@neodrag/svelte";
    import { selectedtile } from "../stores";
    export let number: number;

    function handleLink() {
        if(redirect) {
            window.location.href = link;
        } else window.open(link);
    }

    let height = 0;
    let width = 0;
</script>

<button use:draggable on:click={() => selectedtile.set({
  index: number,
  background: "white",
  border: "none",
  height: height,
  width: width,
  inner: "",
  margin: 0,
  padding: 0,
  type: "Button"
})} class="buttontile">
    <Span defaultText={`Button #${number}`}/>
</button>

<style lang="scss">
  .buttontile {
    outline: none;
    background: white;
    border: none;
    box-sizing: border-box;
    border-radius: 9.5px;
    cursor: pointer;
    min-width: 150px;
    width: auto;
    height: 60px;
    font-style: normal;
    font-weight: 600;
    padding-left: 15px;
    padding-right: 15px;
    font-size: 24px;
    line-height: 29px;
    font-size: 18px;
    color: black;
    transition: .3s linear;

    &:hover {
      background: lighten(black, 66%);
      color: white;
      box-shadow: 7px 7px 0px rgba(255, 255, 255, .10);
    }
  }
</style>
