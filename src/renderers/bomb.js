let bombElement = document.getElementById("bomb")
let bombStyle = bombElement.style
let bombCircle = document.createElement("div")
bombCircle.id = "bomb-circle"
// Add bombCircle to the entities div instead of bombElement
document.getElementById("entities").appendChild(bombCircle)

// Set default circle size if not defined in config
if (!global.config.radar.bombCircleSize) {
    global.config.radar.bombCircleSize = 60; // default size in pixels
}

const circleStyle = document.createElement("style")
circleStyle.textContent = `
#bomb-circle {

    position: absolute;
    width: var(--bomb-circle-size);
    height: var(--bomb-circle-size);
    border: 5px dotted red;
    border-radius: 50%;
    transform: translate(-50%, 50%) scale(1);
    pointer-events: none;
    opacity: 1;
    visibility: visible;

    transition: width 0.3s ease-in-out, height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}


#bomb-circle.hidden {
    opacity: 0;
    visibility: hidden;
    width: 0;
    height: 0;
    transition: visibility 0.3s ease-in-out, opacity 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out;
}


`

document.head.appendChild(circleStyle)
// Add lookup tables for different maps at the top level, where lookupMirage is defined
const lookupTables = {
    mirage: [760, 662, 633, 610, 590, 572, 556, 541, 527, 513, 500, 488, 476, 464, 453, 441, 431, 420, 410, 400, 390],
    nuke: [380, 350, 333, 318, 306, 295, 284, 275, 266, 257, 240, 242, 234, 227, 220, 214, 207, 201, 195, 189, 190],
    nuke_alternate: [375, 349, 332, 317, 305, 293, 282, 272, 262, 253, 237, 229, 221, 214, 207, 200, 193, 187, 181, 180],
    inferno: [510, 471, 447, 428, 411, 395, 381, 368, 355, 344, 320, 322, 312, 302, 292, 283, 274, 266, 257, 249, 250],
    overpass:[510, 474, 452, 433, 416, 401, 387, 375, 362, 351, 327, 330, 320, 310, 301, 292, 283, 275, 267, 257, 260],
    ancient: [615, 574, 549, 527, 507, 490, 473, 458, 443, 429, 398, 403, 391, 380, 368, 358, 347, 337, 327, 317, 320],
    dust2: [460, 424, 402, 383, 366, 350, 336, 323, 310, 298, 270, 276, 265, 255, 245, 236, 227, 218, 209, 201, 205],
    train: [438, 406, 386, 367, 352, 337, 323, 310, 298, 287, 263, 265, 255, 246, 236, 227, 218, 210, 202, 193, 195],
    default: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
};
/*const lookupMirage = [760, 662, 633, 610, 590, 572, 556, 541, 527, 513, 500, 488, 476, 464, 453, 441, 431, 420, 410, 400, 390]; //A TABLE THAT GOES FROM 0 DMG TO 100 DMG FOR PLAYER WITH ARMOR - it gives you distance*/
// Set the CSS variable for circle size
document.documentElement.style.setProperty('--bomb-circle-size', global.config.radar.bombCircleSize + 'px');

// Function to update circle size
function updateBombCircleSize(size) {
    global.config.radar.bombCircleSize = size;
    document.documentElement.style.setProperty('--bomb-circle-size', size + 'px');
}



socket.element.addEventListener("bomb", event => {
    let bomb = event.data
    global.bombStatus = bomb.state;
/*    console.log(global.showDeathRange);
    console.log(global.bombStatus);*/
    if (!(bomb.state == "planted" || bomb.state == "defusing")) {
        global.showDeathRange = false;
        bombCircle.classList.add('hidden');
    }

    if (bomb.state == "carried" || bomb.state == "exploded") {
        bombStyle.display = "none"

    }
    else {
        bombStyle.display = "block"
        let left = global.positionToPerc(bomb.position, "x") + "%";
        let bottom = global.positionToPerc(bomb.position, "y") + "%"
        bombStyle.left = left;
        bombStyle.bottom = bottom

        if((global.currentMap === "de_nuke") && global.showDeathRange){   //ADD HERE OTHE MAPS WITH MULTIPLE SPLITS AFTER TESTING THEM
            let damageRadius = {};
           damageRadius.position = {
                x: bomb.position.x,
                y: bomb.position.y
            };

            let left = global.positionToPerc(damageRadius.position, "x") + "%"
            let bottom = global.positionToPerc(damageRadius.position, "y") + "%"
            bombCircle.style.left = left;
            bombCircle.style.bottom = bottom;
            /*
all that is left to do now is detect if bomb was planted b or a which you can do if the left and bottom dont match so we know which lookup table to use
 */
            if(bombCircle.style.left !== bombStyle.left || bombCircle.style.bottom !== bombStyle.bottom){
                global.alternateSite = true;
            } else {
                global.alternateSite = false;
            }
        } else {
            bombCircle.style.left = left
            bombCircle.style.bottom = bottom

        }




    }

    if (bomb.state == "planted" || bomb.state == "defusing") {


        if(global.showDeathRange && ((global.spectatedHealth !== global.previousState[0]) || (global.spectatedArmor !== global.previousState[1]))){
            bombCircle.classList.remove('hidden');
            updateBombCircleBasedOnHealth();}
        else if (!global.showDeathRange){
            bombCircle.classList.add('hidden');

        }


        bombElement.className = "planted"
        bombCircle.style.borderColor = "#ff0000"

    }
    else if (bomb.state == "defused") {
        bombElement.className = "defused"
        bombCircle.style.borderColor = "#00ff00"

    }
    else {
        bombElement.className = ""
        bombCircle.style.borderColor = "#ff6600"

    }
})


// Update the function
function updateBombCircleBasedOnHealth() {
    // Only proceed if we have both health and armor values
    if (typeof global.spectatedHealth !== 'undefined' && typeof global.spectatedArmor !== 'undefined') {
        let circleSize;
        
        // Get current map name and remove 'de_' prefix
        let mapName = global.currentMap.replace('de_', '').toLowerCase();
        if (global.alternateSite) {
            mapName = mapName + "_alternate"
        }
        
        // Get the appropriate lookup table for the current map
        const currentLookupTable = lookupTables[mapName] || lookupTables.default;

        let localHealth = global.spectatedHealth;
        global.previousState = [localHealth, global.spectatedArmor];
        
        if (global.spectatedArmor === 0) {
            localHealth /= 2;
        }
        
        let valueLower = currentLookupTable[Math.floor((localHealth / 5.0))];
        let valueUpper = currentLookupTable[Math.ceil((localHealth / 5.0))];

        let distance = (valueLower + valueUpper) / 2;

        /*distance = 615; //USED FOR RANGE FINDING, UNCOMMENT WHEN YOU NEED TO CALCULATE*/
        const container = document.getElementById('container');
        const containerSize = Math.min(container.offsetWidth, container.offsetHeight);
        //My way of fixing window size changing. Because initial calculations were done on the default window size where the container has a width and height of 600px, I use that to get the ratio.
        circleSize = (distance / 600)*containerSize;

        updateBombCircleSize(circleSize);

        //NUKE A   50 = 240 100 = 190    0 = 380  325 = 0                  B 291 = 0         100 = 180    50 = 237       0 = 375
        //INFERNO 0 = 510  50 = 320   100 = 250 310 = 0
        //Overpass 0 = 510  50 = 327   100 = 260 325 = 0
        //Ancient 0 = 615  50 = 398   100 = 320 325 = 0
        //Dust 0 = 460  50 = 270   100 = 205 250 = 0
        //Train 0 = 438  50 = 263   100 = 195  250 = 0


    }
}