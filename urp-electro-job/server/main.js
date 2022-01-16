import Core from 'urp-core';
import * as alt from 'alt-server';
import { VehicleSpawn } from '../shared/config';

alt.onClient('delivery:payment', (source) => {
    Core.Money.addMoney(source, 'cash', 25);
    alt.emitClient(source, 'notify', 'success', 'payment', 'you received $25');
});


alt.onClient('spawn:vehicle', (source) => {    
    if (!Core.Money.hasMoney(source, 'cash', 5000)) return alt.emitClient(source, 'no:money'); 
    Core.Money.getPayment(source, 5000);
    const vehicle = new alt.Vehicle('boxville', VehicleSpawn.x, VehicleSpawn.y, VehicleSpawn.z, 0, 0, 0);
    vehicle.numberPlateText = 'job';
    vehicle.engineOn = true;
    vehicle.data = {
        metadata: { fuel: 100 },
    };
    vehicle.setStreamSyncedMeta('engine', true);
    vehicle.setStreamSyncedMeta('fuel', 100);        
    
});

alt.onClient('delete:vehicle', (source) => {
    var veh = source.vehicle;
    if (!veh) return
    veh.destroy();    
    Core.Money.addMoney(source, 'cash', 5000); 
});


alt.on('playerEnteredVehicle', (source, vehicle, seat) => {
    if(!source && !vehicle && !seat) return;
    if(vehicle.model == 2307837162) return alt.emitClient(source, 'start:job');
});

alt.on('playerLeftVehicle', (source, vehicle, seat) => {
    if(!source && !vehicle && !seat) return;
    if(vehicle.model == 2307837162) return alt.emitClient(source, 'end:job');
});