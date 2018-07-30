// Taken from https://stackoverflow.com/a/34683867/7432468 ------
function parseColor(color) {
  var arr=[];
  color.replace(/[\d+\.]+/g, function(v) {
    arr.push(parseFloat(v));
  });
  return {
    hex: "#" + arr.slice(0, 3).map(toHex).join(""),
    opacity: arr.length == 4 ? arr[3] : 1
  };
}
function toHex(int) {
  var hex = int.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
// end ---------------------------------------------------------
