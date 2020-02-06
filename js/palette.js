
var black       = ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'];
var white       = ['#202020', '#404040', '#606060', '#808080', '#9f9f9f', '#bfbfbf', '#dfdfdf', '#ffffff'];
var red         = ['#580902', '#782922', '#984942', '#b86962', '#d88882', '#f7a8a2', '#ffc8c2', '#ffe8e2'];
var cyan        = ['#00373d', '#08575d', '#27777d', '#47969d', '#67b6bd', '#87d6dd', '#a7f6fd', '#c7ffff'];
var purple      = ['#4b0056', '#6b1f76', '#8b3f96', '#aa5fb6', '#ca7fd6', '#ea9ff6', '#ffbfff', '#ffbfff'];
var green       = ['#004000', '#156009', '#358029', '#55a049', '#74c069', '#94e089', '#b4ffa9', '#d4ffc9'];
var blue        = ['#20116d', '#40318d', '#6051ac', '#8071cc', '#9f90ec', '#bfb0ff', '#dfd0ff', '#fff0ff'];
var yellow      = ['#202f00', '#404f00', '#606f13', '#808e33', '#9fae53', '#bfce72', '#dfee92', '#ffffb2'];
var orange      = ['#4b1500', '#6b3409', '#8b5429', '#aa7449', '#ca9469', '#eab489', '#ffd4a9', '#fff4c9'];
var brown       = ["#372200", "#574200", "#776219", "#978139", "#b7a158", "#d7c178", "#f6e198", "#ffffb8"];
var yellowgreen = ["#093a00", "#285900", "#487919", "#689939", "#88b958", "#a8d978", "#c8f998", "#e8ffb8"];
var pink        = ["#5d0120", "#7d2140", "#9c4160", "#bc6180", "#dc809f", "#fca0bf", "#ffc0df", "#ffe0ff"];
var bluegreen   = ["#003f20", "#035f40", "#237f60", "#439e80", "#63be9f", "#82debf", "#a2fedf", "#c2ffff"];
var lightblue   = ["#002b56", "#154b76", "#356b96", "#558bb6", "#74abd6", "#94cbf6", "#b4eaff", "#d4ffff"];
var darkblue    = ["#370667", "#572687", "#7746a7", "#9766c6", "#b786e6", "#d7a6ff", "#f6c5ff", "#ffe5ff"];
var lightgreen  = ["#004202", "#086222", "#278242", "#47a262", "#67c282", "#87e2a2", "#a7ffc2", "#c7ffe2"];

let palette = allColors();

let chosenColor = '#000000';

function allColors() {
    var all = [];
    var sets = [black, white, red, cyan, purple, green, blue, yellow,
                orange, brown, yellowgreen, pink, bluegreen, lightblue, 
                darkblue, lightgreen];
    for (set of sets) {
        for (color of set)
            all.push(color);
    }

    return all;
}

/**
 * Displays the custom palette based color picker
 * which invokes the provided callback when closed
 * @param {function(color)} callback 
 */
function showPicker(callback) {
    let title = "COLOR PICKER";
    
    let body = $('#palette-div');
    if (body.length <= 0) {
        body = "<div id='palette-div'>" + 
                    "<canvas id='palette-canvas' width='300' height='300'></canvas>" +
                    "<span id='chosen-color'></span>" +
               "</div>";
    }

    buildModal(title, body, function() {
        callback(chosenColor)
    });

    // body = $('.sidebar-header').append(body);

    setTimeout(function() {
        let canvas = $("#palette-canvas")[0];
        
        canvas.width = $('#palette-canvas').parent().width();

        let context = canvas.getContext('2d');
        context.imageSmoothingEnabled = false;

        let w = 8;
        let h = 16;

        let cw = Math.floor(canvas.width / w);
        let ch = Math.floor(canvas.height / h);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                // context.beginPath();
                context.fillStyle = palette[x + y * w];
                context.fillRect(x * cw, y * ch, cw, ch);
                context.fill();
                // context.stroke();
            }
        }

        canvas.addEventListener('mouseup', onPaletteMouseUp);
    }, 500);
}

function onPaletteMouseUp(e) {
    let canvas = $('#palette-canvas')[0];
    let x = e.clientX - canvas.getClientRects()[0].x;
    let y = e.clientY - canvas.getClientRects()[0].y;
    
    let w = 8;
    let h = 16;

    let cw = Math.floor(canvas.width / w);
    let ch = Math.floor(canvas.height / h);

    let cx = Math.floor(x / cw);
    let cy = Math.floor(y / ch);
    let targetColor = cy * 8 + cx;

    chosenColor = palette[targetColor]; 
    
    $('#chosen-color').css('background', chosenColor).text(chosenColor);
}

function buildModal(title, body, saveCallback, cancelCallback) {
    if (!body)
        return;
    
    var modalDiv = 
        '<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">' + 
            '<div class="modal-dialog modal-dialog-centered" role="document">' + 
                '<div class="modal-content">' + 
                    '<div class="modal-header">' + 
                        '<h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5>' + 
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' + 
                        '    <span aria-hidden="true">&times;</span>' + 
                        '</button>' + 
                    '</div>' + 
                    '<div class="modal-body">' + 
                    // Content will be here
                    '</div>' + 
                    '<div class="modal-footer">' + 
                        '<button type="button" class="btn btn-secondary" id="btn-modal-close">Close</button>' + 
                        '<button type="button" class="btn btn-primary" id="btn-modal-save">Save changes</button>' + 
                    '</div>' + 
                '</div>' + 
            '</div>' + 
        '</div>';
    
    // Prepare the DOM element
    let $modal = $(modalDiv);
    // Title
    $modal.find('.modal-title').text(title);
    // Include the body
    $modal.find('.modal-body').append(body);

    // Show the dialogue
    $modal.modal();

    if (saveCallback) {
        // Save callback
        $modal.find('#btn-modal-save').on('click', function (event) {
            if (saveCallback)
                saveCallback();

            $modal.modal('hide');
        });
    } else {
        // Avoid showing the save button if there's no save forseen
        $modal.find('#btn-modal-save').hide();
    }

    // Cancel callback (this would be called also on success :()
    $modal.find('#btn-modal-close').on('click', function (event) {
        if (cancelCallback)
            cancelCallback();

        $modal.modal('hide');
    });

    // Destroy on close
    $modal.on('hidden.bs.modal', function (event) {
        $modal.modal('dispose');
        currentModal = null;
    });

    return $modal;
}

module.exports = {
    palette: palette,
    showPicker: showPicker
};