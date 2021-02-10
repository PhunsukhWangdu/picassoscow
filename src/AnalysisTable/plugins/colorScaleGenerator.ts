function buleColorScaleGenerator(values: number[]) {
  // 根据values数组的区间生成热力背景颜色
  const min = Math.min.apply(Math, values);
  const max = Math.max.apply(Math, values);
  return (x: number) => {
    // eslint-disable-next-line no-magic-numbers
    const R = 255 - Math.round((255 * (x - min)) / (max - min));
    const G = 255 - Math.round((123 * (x - min)) / (max - min));
    //return { backgroundColor: `rgb(255,${nonRed},${nonRed})` };
    return { backgroundColor: `rgb(${R},${G},255)` };
  };
}

function redColorScaleGenerator(values: number[]) {
  const min = Math.min.apply(Math, values);
  const max = Math.max.apply(Math, values);
  return (x: number) => {
    // eslint-disable-next-line no-magic-numbers
    const nonRed = 255 - Math.round((255 * (x - min)) / (max - min));
    return { backgroundColor: `rgb(255,${nonRed},${nonRed})` };
  };
}

export default {
  red: redColorScaleGenerator,
  blue: buleColorScaleGenerator,
}
