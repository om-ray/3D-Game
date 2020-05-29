export let collisionChecker = function (a, b) {
  if (a.intersectsBox(b)) {
    return true;
  }
};
