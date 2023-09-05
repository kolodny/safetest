<script lang="ts">
  export let startingNumber = 0
  let count = startingNumber
  const increment = () => {
    count += 1
  }
</script>

<button on:click={increment}>
  count is {count}
</button>
