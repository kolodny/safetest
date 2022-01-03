<script>
  let count = 0;
  const increment = () => {
    count += 1;
  };
</script>

<div on:click={increment}>
  State is {count}
</div>
