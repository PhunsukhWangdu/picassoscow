const traverse = <T extends { children?: T[] }> (tar: T, fn: (params: T) => boolean) => {
  if (fn(tar) === false) return false;

  if (tar && tar.children) {
    for (let i = tar.children.length - 1; i >= 0; i--) {
      if (!traverse(tar.children[i], fn)) return false;
    }
  }

  return true;
}

export default traverse;