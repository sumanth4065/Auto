import { CarKineticStatus, LossCause } from "@lib/types"
import { Pages } from "../../shared/pages"
import { RouteType } from "../../types"
import { getRoute } from "./getRoute"
import { mockState } from "../../shared/fixtures"

describe('getRoute', () => {

  const mockWhoWasDrivingBackNavigation = {
    appState: 'carStatus',
    [CarKineticStatus.BeingDriven]: {
      appState: 'statusVehicleWhileDriven.code',
      default: Pages.DrivenIncidentDetails,
      [LossCause.WEATHERRELATEDCOMP]: Pages.DamageByWeather
    }
  } as RouteType


  it('Should return the route if the logic is nested', () => {
    let mockAppState = mockState
    mockAppState = {
      ...mockAppState,
      carStatus: CarKineticStatus.BeingDriven,
      statusVehicleWhileDriven: {
        description: '',
        code: LossCause.WEATHERRELATEDCOMP
      }
    }

    const result = getRoute(mockWhoWasDrivingBackNavigation, mockAppState)
    expect(result).toBe(Pages.DamageByWeather)
  })

  it('Should return the route if the logic is nested for default page', () => {
    let mockAppState = mockState
    mockAppState = {
      ...mockAppState,
      carStatus: CarKineticStatus.BeingDriven,
      statusVehicleWhileDriven: undefined
    }

    const result = getRoute(mockWhoWasDrivingBackNavigation, mockAppState)
    expect(result).toBe(Pages.DrivenIncidentDetails)
  })
})