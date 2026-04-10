(function () {
  function toNumber(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  var CITY_BASE = {
    "los-angeles": 22,
    "houston": 24,
    "new-york": 23,
    "miami": 26,
    "chicago": 21,
    "seattle": 20
  };

  function calcPremium(input) {
    var base = CITY_BASE[input.city] || 21;
    var propertyFactor = 1 + clamp((input.propertyValue - 20000) / 100000, -0.15, 0.45);

    var deductibleFactor = 1;
    if (input.deductible === 250) deductibleFactor = 1.18;
    if (input.deductible === 500) deductibleFactor = 1.0;
    if (input.deductible === 1000) deductibleFactor = 0.88;

    var liabilityFactor = input.liabilityLimit >= 300000 ? 1.12 : 1.0;
    var claimsFactor = input.priorClaims ? 1.22 : 1.0;
    var bundleFactor = input.bundle ? 0.9 : 1.0;
    var alarmFactor = input.alarm ? 0.94 : 1.0;

    var monthly = base * propertyFactor * deductibleFactor * liabilityFactor * claimsFactor * bundleFactor * alarmFactor;
    monthly = clamp(monthly, 8, 90);

    return {
      low: (monthly * 0.85).toFixed(2),
      avg: monthly.toFixed(2),
      high: (monthly * 1.15).toFixed(2)
    };
  }

  function readForm(form) {
    return {
      city: form.city.value,
      propertyValue: toNumber(form.propertyValue.value, 20000),
      deductible: toNumber(form.deductible.value, 500),
      liabilityLimit: toNumber(form.liabilityLimit.value, 100000),
      priorClaims: form.priorClaims.checked,
      bundle: form.bundle.checked,
      alarm: form.alarm.checked
    };
  }

  function mountCalculator(formId, outputId) {
    var form = document.getElementById(formId);
    var output = document.getElementById(outputId);
    if (!form || !output) return;

    function render() {
      var result = calcPremium(readForm(form));
      output.innerHTML =
        "<strong>Estimated Monthly Premium:</strong> $" +
        result.avg +
        " <br><small>Typical range: $" +
        result.low +
        " - $" +
        result.high +
        " / month</small>";
    }

    form.addEventListener("input", render);
    render();
  }

  window.RentersPremiumCalculator = {
    mountCalculator: mountCalculator
  };
})();
