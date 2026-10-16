import { witnessHelper } from "./witnessHelper";

describe( 'witnessHelper', () => {
  it( 'returns undefined when reqbody doesn\'t have witness property', () => {
    const result = witnessHelper( undefined );

    expect( result ).toBe( undefined );
  } );

  it( 'returns witness information when is present in the reqbody', () => {
    const result = witnessHelper( {
      firstName: 'some-witness-first-name',
      lastName: 'some-witness-last-name',
    } );

    expect( result ).toEqual( [
      {
        role: 'witness',
        injured: false,
        contact: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
        }
      }
    ] )
  } )
  it( 'returns witness information when is present in the reqbody including mobilePhone', () => {
    const result = witnessHelper( {
      firstName: 'some-witness-first-name',
      lastName: 'some-witness-last-name',
      mobilePhone: 'some-witness-mobile-phone'
    } );

    expect( result ).toEqual( [
      {
        role: 'witness',
        injured: false,
        contact: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          cellNumber: 'some-witness-mobile-phone',
          primaryPhoneType: 'mobile'
        }
      }
    ] )
  } )
} )