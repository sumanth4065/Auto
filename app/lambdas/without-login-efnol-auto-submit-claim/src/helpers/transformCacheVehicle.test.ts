import { transformCacheVehicles } from "./transformCacheVehicles";


describe( 'transformCacheVehicles', () => {
  it( 'transfroms each ICachedAutoVehicle from the list to IGuideWireAutoVehicle', () => {
    const result = transformCacheVehicles(
      [
        {
          state: 'some-vehicle-state',
          country: 'some-vehicle-country',
          year: 1,
          make: 'some-vehicle-make',
          model: 'some-vehicle-model',
          policyVehicle: true,
          coverages: [
            {
              name: 'some-coverage-name',
              incidentLimit: {
                currency: 'some-currency',
                amount: 1
              }
            },
          ],
          publicID: 'some-public-id',
          vin: 'some-vehicle-vin',
          vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
        }
      ]
    );

    expect( result ).toEqual( [
      {
        state: 'some-vehicle-state',
        country: 'some-vehicle-country',
        year: 1,
        make: 'some-vehicle-make',
        model: 'some-vehicle-model',
        policyVehicle: true,
        coverages: [
          {
            name: 'some-coverage-name',
            incidentLimit: {
              currency: 'some-currency',
              amount: 1
            }
          },
        ],
        publicID: 'some-public-id',
        vin: 'some-vehicle-vin'
      }
    ] )
  } );
} );