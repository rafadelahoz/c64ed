const fs = require('fs');
const pathlib = require('path');
const { dialog } = require('electron').remote;

var path = "./";

function save(filename, data) {
    console.log(pathlib.join(process.cwd(), path + filename));
    var sdata = JSON.stringify(data, null, '\t');

    try {
        var filepath = dialog.showSaveDialog({
            title: 'Where to save?', 
            buttonLabel: 'THIS IS THE PLACE',
            filters: [{name: 'MAPS', extensions: ['json']}],
            defaultPath: filename
        });
        fs.writeFileSync(filepath, sdata, 'utf-8');
    } catch (e) {
        alert("Failed to save:\n" + e);
    }
}

function load(filename) {
    let data = null;
    try {
        var filepath = dialog.showOpenDialog({
            title: 'Select a map file to load', 
            buttonLabel: 'THIS IS THE MAP',
            filters: [{name: 'MAPS', extensions: ['json']}]
        });

        if (filepath)
        {
            let contents = fs.readFileSync(filepath[0], 'utf-8');
            data = JSON.parse(contents);
        }
    } catch (e) {
        alert("Failed to read:\n" + e);
    }

    return data;
}

module.exports = {
    save: save,
    load: load
}