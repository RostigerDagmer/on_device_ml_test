<template>
  <div>
    <nav>
      <NuxtLink :class="{'page-link': true, 'page-link--active': $route.path === '/'}" to="/">Sentence similarity</NuxtLink>
      <NuxtLink :class="{'page-link': true, 'page-link--active': $route.path === '/fulltext'}" to="/fulltext">Fulltext search</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>


<style>

nav {
  display: flex;
  width: 100%;
  justify-content: center;
}

.page-link {
  margin: 1rem;
  color: black;
}

.page-link--active {
  font-weight: bold;
  text-decoration: underline;
}
</style>