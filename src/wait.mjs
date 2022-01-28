const wait = dur => new Promise((resolve) => {
  setTimeout(resolve, dur)
})

export default wait