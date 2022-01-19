const filters = (function(){

function filterIdentity(r, g, b){
    return {r: r, g: g, b: b};
}

function filterNegativo(r, g, b){
    return {r: 255 - r, g: 255 - g, b: 255 - b};
}

function filterGrayScale(r, g, b){
    const brigh = (r + g + b) / 3;
    return {r: brigh, g: brigh, b: brigh};
}

function filterRedScale(r, g, b){
    const brigh = (r + g + b) / 3;
    return {r: brigh, g: 0, b: 0};
}

function filterGreenScale(r, g, b){
    const brigh = (r + g + b) / 3;
    return {r: 0, g: brigh, b: 0};
}

function filterBlueScale(r, g, b){
    const brigh = (r + g + b) / 3;
    return {r: 0, g: 0, b: brigh};
}

const filters = {
    'None': filterIdentity,
    'Negative': filterNegativo,
    'Gray Scale': filterGrayScale,
    'Red Scale': filterRedScale,
    'Green Scale': filterGreenScale,
    'Blue Scale': filterBlueScale
};

return filters;
})();