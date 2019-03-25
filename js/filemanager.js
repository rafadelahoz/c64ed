const fs = require('fs');
const pathlib = require('path');

var path = "./";

function save(filename, data) {
    console.log(pathlib.join(process.cwd(), path + filename));
    var sdata = JSON.stringify(data);
    try {
        fs.writeFileSync(path + filename, sdata, 'utf-8');
    } catch (e) {
        alert("Failed to save:\n" + e);
    }
}

function load(filename) {
    let data = null;
    try {
        let contents = fs.readFileSync(path + filename, 'utf-8');
        data = JSON.parse(contents);
    } catch (e) {
        alert("Failed to read:\n" + e);
    }

    return data;
}

module.exports = {
    save: save,
    load: load
}