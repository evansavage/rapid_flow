
  // Recursive function for finding total volume at intersection level
  function totalLevel(obj) {
    var total = 0;
    var k;

    // Check if the current obj has further nested properties, o.w. return the
    // nested value and add it to the total

    if (obj instanceof Object) {
      for (k in obj) {
        if (obj.hasOwnProperty(k)) {
          total += totalLevel(obj[k]);
        }
      }
    } else {
      return obj
    }
    return total
  }
