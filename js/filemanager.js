const fs = require('fs');
const pathlib = require('path');
const { dialog } = require('electron').remote;

var path = "./";

function save(filename, data) {
    console.log(pathlib.join(process.cwd(), path + filename));
    var sdata = JSON.stringify(data, function(k,v) {
        if ((k == "bg" || k == "fg" || k == "solids") && v instanceof Array) {
            return JSON.stringify(v);
        }

        return v;
    }, '\t');

    sdata = sdata.replace(/\"\[/g, "[");
    sdata = sdata.replace(/\]\"/g, "]"); 

    try {
        var filepath = dialog.showSaveDialog({
            title: 'Where to save?', 
            buttonLabel: 'Save',
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
            buttonLabel: 'Load',
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