<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;

    let list = data.list;
    let name: string, description: Blob;

    const removeFromList = (id: number): void => {
        document.getElementById("selectId").value = id;
    }

    const displaySaveBtn = (id: number): void  =>{
        document.getElementById("name_" + id).disabled = false;
        document.getElementById("description_" + id).disabled = false;
        document.getElementById("edit_delete_div_" + id).style.display = "none";
        document.getElementById("save_cancel_div_" + id).style.display =
            "inline-flex";

        name = document.getElementById("name_" + id).value;
        description = document.getElementById("description_" + id).value;
    }

    const displayEditBtn = (id: number): void  => {
        document.getElementById("name_" + id).disabled = true;
        document.getElementById("description_" + id).disabled = true;
        document.getElementById("edit_delete_div_" + id).style.display =
            "inline-flex";
        document.getElementById("save_cancel_div_" + id).style.display = "none";

        document.getElementById("name_" + id).value = name;
        document.getElementById("description_" + id).value = description;
    }
</script>

<form method="post">
    <div class="list">
        <div class="register">
            <div style="display:flex; align-items:center">
                Name:<input id="name" name="name" type="input" />
            </div>
            <div style="display:flex; align-items:center">
                Description:<textarea id="description" name="description" />
            </div>
            <button
                class="button large save"
                type="submit"
                formaction="?/registerRecord">Add</button
            >
        </div>
        <div class="list">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#each list as record, index}
                        <tr on:click={() => removeFromList(record.id)}>
                            <td>{++index}</td>
                            <td
                                ><input
                                    id="name_{record.id}"
                                    name="name_{record.id}"
                                    value={record.name}
                                    disabled
                                /></td
                            >
                            <td
                                ><textarea
                                    id="description_{record.id}"
                                    name="description_{record.id}"
                                    disabled>{record.description}</textarea
                                ></td
                            >
                            <td style="display:inline-flex gap:10px">
                                <div
                                    id="edit_delete_div_{record.id}"
                                    style="display:inline-flex"
                                >
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div
                                        class="button edit"
                                        on:click={() =>
                                            displaySaveBtn(record.id)}
                                        id="edit_{record.id}"
                                    >
                                        Edit
                                    </div>
                                    <button
                                        class="button delete"
                                        type="submit"
                                        formaction="?/deleteRecord"
                                        >Delete</button
                                    >
                                </div>
                                <div
                                    style="display: none;"
                                    id="save_cancel_div_{record.id}"
                                >
                                    <button
                                        class="button save"
                                        type="submit"
                                        formaction="?/updateRecord"
                                        id="save_{record.id}"
                                        style="visibility">Save</button
                                    >
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div
                                        class="button cancel"
                                        id="cancel_{record.id}"
                                        on:click={() =>
                                            displayEditBtn(record.id)}
                                    >
                                        Cancel
                                    </div>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
                <input type="hidden" id="selectId" name="selectId" />
            </table>
        </div>
    </div>
</form>

<style lang="scss">
    .list {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 800px;
        margin: auto;
        margin-top: 50px;
        color: white;
        .register {
            display: flex;
            justify-content: space-between;
            width: 100%;
            padding: 20px;
            border: 1px white solid;
        }

        .list {
            display: flex;
            flex-direction: column;
            width: 100%;
            margin-top: 30px;
            table {
                border-collapse: collapse;
                border-spacing: 0;
                width: 100%;
                border: 1px solid #ddd;
            }

            /* Style table headers and table data */
            th,
            td {
                text-align: center;
                padding: 16px;
            }

            /* Zebra-striped table rows */
            tr:nth-child(even) {
                background-color: #252525;
            }
        }
    }

    .button {
        border: none;
        padding: 5px 5px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 12px;
        margin: 4px 2px;
        border-radius: 6px;
        cursor: pointer;
    }

    .large {
        font-size: 16px;
        padding: 10px 25px;
    }

    .button:hover {
        color: white;
    }

    .save {
        background-color: white;
        color: black;
        border: 2px solid #4caf50;
    }

    .save:hover {
        background-color: #4caf50;
    }

    .delete {
        background-color: white;
        color: black;
        border: 2px solid #f44336;
    }

    .delete:hover {
        background-color: #f44336;
    }

    .cancel {
        background-color: white;
        color: black;
        border: 2px solid #008cba;
    }

    .cancel:hover {
        background-color: #008cba;
    }

    .edit {
        background-color: white;
        color: black;
        border: 2px solid #555555;
    }

    .edit:hover {
        background-color: #555555;
    }
</style>
