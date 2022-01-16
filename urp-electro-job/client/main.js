import Core from 'urp-core';
import * as natives from 'natives';
import * as alt from 'alt-client';

import { START_JOB, COORDS_LIST, VehicleDelete } from '../shared/config';

let service = false;
let cds = 0;
let blip = null;
let playerinveh = false;
let fixed = false

alt.on('keydown', (key) => {
    let scriptID = alt.Player.local.scriptID;
    let diststartJob = alt.Player.local.pos.distanceTo(START_JOB) < 2.5;
    let storeVehicle = alt.Player.local.pos.distanceTo(VehicleDelete) < 2.5;
    let dist = alt.Player.local.pos.distanceTo(COORDS_LIST[cds]) < 2.5;
    if (key == 69 && diststartJob && !service) {
        alt.emitServer('spawn:vehicle');
        alt.setTimeout(() => {
            if (service) return service = false;
            service = true
            alt.emit('notify', 'important', 'DELIVERY JOB', 'GOOD WORK');
            cds = Math.floor(COORDS_LIST.length * Math.random());
            blip = generateBlip(COORDS_LIST[cds]);
        }, 500);
    }
    if (key == 69 && storeVehicle) {
        alt.log(playerinveh);
        if(playerinveh && service) {
            blip.destroy();
            alt.emitServer('delete:vehicle');
            service = false;
            fixed = false;
        }
    }
    if (key == 69 && dist) {
        natives.disableAllControlActions(true);
        natives.taskStartScenarioInPlace(scriptID, "WORLD_HUMAN_CLIPBOARD", 0, true)          
        alt.setTimeout(() => {
            natives.taskStartScenarioInPlace(scriptID, "CODE_HUMAN_POLICE_INVESTIGATE", 0, true)
        }, 10000);

        alt.setTimeout(() => {
            natives.taskStartScenarioInPlace(scriptID, "WORLD_HUMAN_WELDING", 0, true)
        }, 25000);
        // stop anim 
        alt.setTimeout(() => {
            natives.clearPedTasksImmediately(scriptID);
            natives.disableAllControlActions(false);
        }, 39000);

        alt.setTimeout(() => {
            blip.destroy();
            playerinveh = false;
            fixed = true;
        alt.emitServer('delivery:payment');
        }, 39500);
    }
});

alt.everyTick(async () => {
    if (!service || !playerinveh) return;
    if (!fixed) return;
    fixed = false;
    alt.setTimeout(() => {
        alt.emit(
            'notify',
            'important',
            'DELIVERY JOB',
            'you received a new order'
        );
        cds = Math.floor(COORDS_LIST.length * Math.random());
        blip = generateBlip(COORDS_LIST[cds]);
    }, parseInt(Math.abs(Math.random() * (5000 - 50000) + 5000)));
});

alt.everyTick(async () => {
    if (!service) return;
    let dist = alt.Player.local.pos.distanceTo(COORDS_LIST[cds]) < 1.5;
    if (!dist || fixed) return;
    drawMarker(COORDS_LIST[cds]);
    Core.Utils.drawTextHelper('PRESS ~r~E~w~ TO FIX', 0.5, 0.93);
});

alt.everyTick(async () => {
    if (!service) return;
    let dist = alt.Player.local.pos.distanceTo(VehicleDelete) < 1.5;
    if (!dist) return;
    drawMarker(VehicleDelete);
    Core.Utils.drawTextHelper('PRESS ~r~E~w~ TO STORE VEHICLE', 0.5, 0.93);
});

alt.onServer('no:money', () =>{
    service = true
})

alt.onServer('start:job', () =>{
    playerinveh = true;
})

alt.onServer('end:job', () =>{
    playerinveh = false;
})

function drawMarker(pos) {
    natives.drawMarker(
        21,
        pos.x,
        pos.y,
        pos.z - 0,
        0,
        0,
        0,
        0,
        180,
        0,
        0.5,
        0.5,
        0.5,
        0,
        0,
        255,
        50,
        true,
        true,
        2,
        1,
        0,
        0,
        false
    );
}

const generateBlip = (cds) => {
    const pointBlip = new alt.PointBlip(cds.x, cds.y, cds.z);
    pointBlip.name = `point`;
    pointBlip.sprite = 1;
    pointBlip.color = 5;
    pointBlip.shortRange = true;
    pointBlip.route = true;
    return pointBlip;
};
