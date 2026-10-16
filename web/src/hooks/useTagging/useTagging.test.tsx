import * as Router from 'react-router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { LoginFlowType } from '@lib/shared-contracts';
import { KnockoutReason } from '@lib/types';
import { useTagging } from './useTagging';
import { commonTags, KnockoutReasonTag } from '../../utils/TaggingService/TaggingService';

import { Pages } from '../../shared/pages';

// Do NOT vi.mock('react-router'): setup.ts loads useTagging (via ../hooks) before any
// test file's vi.mock() registers, so the hook holds the real react-router namespace.
// Spying on that shared real namespace is the only way to reach the hook.

const POLICY_NUMBER = 'ATX123456789';

const appStateMock = Object.freeze({
  errorReason: '%%KNOCKOUTREASON%%',
  knockoutReason: '%%KNOCKOUTREASON%%',
  claimNumber: '123456789',
  claimType: 'ALL_OTHER_DAMAGE',
  carStatus: 'beingDriven',
  statusVehicleWhileDriven: {
    code: 'animalcomp'
  },
  enableTextCommunication: true,
  loginFlowType: LoginFlowType.ANONYMOUS,
  policyNumber: POLICY_NUMBER
});

describe('useTagging', () => {
  beforeEach(() => {
    vi.spyOn(Router, 'useOutletContext').mockImplementation(() => [appStateMock, vi.fn()]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Page: my account:insurance:easy auto fnol:introtransition', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.IntroTransition }) as any
    );
    const { result } = renderHook(() => useTagging());
    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      page: 'my account:insurance:easy auto fnol:introtransition',
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  it('Page: my account:insurance:easy auto fnol:whattoexpect', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(() => ({ pathname: Pages.Intro }) as any);

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      page: 'my account:insurance:easy auto fnol:whattoexpect',
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:claimtype', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.FilingClaim }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      page: 'my account:insurance:easy auto fnol:claimtype',
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:safeliteredirect', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.GlassDamage }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:safeliteredirect',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('CTA/Page: my account:insurance:easy auto fnol:safeliteredirect-continue', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.RedirectToSafelite }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:safeliteredirect-continue',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
    result.current.fireTag('safeliteredirect-continue');
    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:safeliteredirect-continue',
      cta: 'my account:insurance:easy auto fnol:safeliteredirect-continue',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:claimreporter', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.WhoIsReporting }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:claimreporter',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:customdriver', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.CustomDriver }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:customdriver',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  it('Page: my account:insurance:easy auto fnol:customvehicle', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.CustomVehicle }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:customvehicle',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  it('Page: my account:insurance:easy auto fnol:knockout', async () => {
    const newAppStateMock = Object.assign(
      {},
      {
        ...appStateMock,
        knockoutReason: KnockoutReason.ReporterNotListed
      }
    );
    vi.spyOn(Router, 'useOutletContext').mockImplementation(() => [newAppStateMock, vi.fn()]);
    vi.spyOn(Router, 'useLocation').mockImplementation(() => ({ pathname: Pages.Knockout }) as any);

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:knockout',
      error: 'reporter not listed',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:contactinfo', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.ContactInformation }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:contactinfo',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  it('Page my account:insurance:easy auto fnol:whereaccident', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.WhereAccident }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:whereaccident',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page my account:insurance:easy auto fnol:incidentdetails', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.WhenAccident }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:incidentdetails',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:carinvolved', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.VehicleInvolved }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:carinvolved',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:glassdamagelocation');
  it('Page: my account:insurance:easy auto fnol:carkineticstatus', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.DrivenOrParked }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      platform: 'desktop',
      page: 'my account:insurance:easy auto fnol:carkineticstatus',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789'
    });
  });
  it('Page: my account:insurance:easy auto fnol:drivenwhathappened', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.DrivenIncidentDetails }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:drivenwhathappened',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      platform: 'desktop',
      ins_claim_id: '123456789'
    });
  });
  it('Page: my account:insurance:easy auto fnol:parkedwhathappened', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.ParkedIncidentDetails }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:parkedwhathappened',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:additionaldetails', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.WhatHappened }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:additionaldetails',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:cardamagetransition', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.CarDetailsTransitionPage }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:cardamagetransition',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:owner');
  it.todo('Page: my account:insurance:easy auto fnol:ownernotlisted'); // this one is a conditional render, should address that component separately
  it('Page: my account:insurance:easy auto fnol:driver', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.WhoWasDriving }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:driver',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:drivernotlisted', async () => {
    const newAppStateMock = Object.assign(
      {},
      { ...appStateMock, knockoutReason: KnockoutReason.DriverNotListed }
    );
    vi.spyOn(Router, 'useLocation').mockImplementation(() => ({ pathname: Pages.Knockout }) as any);
    vi.spyOn(Router, 'useOutletContext').mockImplementation(() => [newAppStateMock, vi.fn()]);

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      error: KnockoutReasonTag.unlistedDriver,
      page: 'my account:insurance:easy auto fnol:knockout',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:passenger');
  it('Page: my account:insurance:easy auto fnol:injured', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.AnyoneInjured }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:injured',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:towed', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.VehicleTowed }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:towed',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:vehicledamage', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.VehicleDamage }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'glass',
      page: 'my account:insurance:easy auto fnol:vehicledamage',
      product: ['accident'],
      text_opt_in: 'true',
      ins_claim_id: '123456789'
    });
  });
  it('Page: my account:insurance:easy auto fnol:vehiclesinvolvednumber', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.NumberOfVehiclesInvolved }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:vehiclesinvolvednumber',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:otherpartyinformationtransition', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyTransition }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:otherpartyinformationtransition',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:doyouknowyearmakemodel');
  it('Page: my account:insurance:easy auto fnol:yearmakemodel', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyYMM }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:yearmakemodel',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:otherpartyinsuredcheck');
  it('Page: my account:insurance:easy auto fnol:otherpartyinsuranceinfo', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyInsurance }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:otherpartyinsuranceinfo',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:otherpartyvehicledriver');
  it('Page: my account:insurance:easy auto fnol:otherpartyvehicledriverinfo', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyDriverInformation }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:otherpartyvehicledriverinfo',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:otherpartypassengercount');
  it('Page: my account:insurance:easy auto fnol:otherpartyinjuredcheck', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyAnyoneInjured }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:otherpartyinjuredcheck',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:additionaldetailstransitionnodeid');
  it('Page: my account:insurance:easy auto fnol:pedestrianorcyclistinvolved', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyPedestrian }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:pedestrianorcyclistinvolved',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:witness', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyWitnesses }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:witnessinfo',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:witnessinfo'); // this tag is a very particular case for witness page
  it('Page: my account:insurance:easy auto fnol:additionalpropertydamage', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.OtherPartyPropertyDamage }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:additionalpropertydamage',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:accidentreview', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.ReviewClaim }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:accidentreview',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });
  it('Page: my account:insurance:easy auto fnol:confirmation', async () => {
    const newAppStateMock = Object.assign(
      {},
      {
        ...appStateMock,
        carStatus: 'parked',
        statusVehicleWhileParked: {
          code: 'vandalismcomp'
        }
      }
    );
    vi.spyOn(Router, 'useOutletContext').mockImplementation(() => [newAppStateMock, vi.fn()]);
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.Confirmation }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'parked:vandalized',
      page: 'my account:insurance:easy auto fnol:confirmation',
      product: ['parked:vandalized'],
      text_opt_in: 'true',
      confirmation_id: 'fnola123456789',
      ins_claim_id: '123456789',
      platform: 'desktop',
      quantity: ['1']
    });
  });
  it('Page: my account:insurance:easy auto fnol:confirmation', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.Confirmation }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:confirmation',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      confirmation_id: 'fnola123456789',
      ins_claim_id: '123456789',
      platform: 'desktop',
      quantity: ['1']
    });
  });

  it('Page: my account:insurance:easy auto fnol:customreporter', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.CustomReporter }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:customreporter',
      product: ['driven:impact with an animal'],
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  it('Page: my account:insurance:easy auto fnol:knockout', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(() => ({ pathname: Pages.Knockout }) as any);
    vi.spyOn(Router, 'useOutletContext').mockImplementation(() => [
      { ...appStateMock, knockoutReason: KnockoutReason.VehicleNotListed },
      vi.fn()
    ]);
    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:knockout',
      product: ['driven:impact with an animal'],
      subchannel1: 'insurance',
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop',
      error: KnockoutReasonTag.unlistedVehicle
    });
  });
  it.todo('Page: my account:insurance:easy auto fnol:multipleclaimant');
  it('Page: my account:insurance:easy auto fnol:knockout', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(() => ({ pathname: Pages.Knockout }) as any);

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      error: '%%KNOCKOUTREASON%%',
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:knockout',
      product: ['driven:impact with an animal'],
      subchannel1: 'insurance',
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  it('Page: my account:insurance:easy auto fnol:error system', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.SystemError }) as any
    );

    const { result } = renderHook(() => useTagging());

    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      error: '%%KNOCKOUTREASON%%',
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:error-system',
      product: ['driven:impact with an animal'],
      subchannel1: 'insurance',
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  it('Page: my account:insurance:easy auto fnol:error policy', async () => {
    vi.spyOn(Router, 'useLocation').mockImplementation(
      () => ({ pathname: Pages.PolicyError }) as any
    );
    const { result } = renderHook(() => useTagging());
    expect(result.current.tags).toEqual({
      ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
      ins_policy: ['ATX'],
      error: '%%KNOCKOUTREASON%%',
      flow: 'driven:impact with an animal',
      page: 'my account:insurance:easy auto fnol:error-policy',
      product: ['driven:impact with an animal'],
      subchannel1: 'insurance',
      text_opt_in: 'true',
      ins_claim_id: '123456789',
      platform: 'desktop'
    });
  });

  describe('CTA scenarios', () => {
    it('fires cta for user events', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.SystemError }) as any
      );

      const { result } = renderHook(() => useTagging());

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
        ins_policy: ['ATX'],
        error: '%%KNOCKOUTREASON%%',
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:easy auto fnol:error-system',
        product: ['driven:impact with an animal'],
        subchannel1: 'insurance',
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
      result.current.fireTag('some cta');

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
        ins_policy: ['ATX'],
        error: '%%KNOCKOUTREASON%%',
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:easy auto fnol:error-system',
        cta: 'my account:insurance:easy auto fnol:some cta',
        product: ['driven:impact with an animal'],
        subchannel1: 'insurance',
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
    });
  });

  describe('Behind login flow', () => {
    beforeEach(() => {
      const newAppStateMock = Object.assign(
        {},
        { ...appStateMock, loginFlowType: LoginFlowType.BEHIND_LOGIN }
      );
      vi.spyOn(Router, 'useOutletContext').mockImplementation(() => [newAppStateMock, vi.fn()]);
    });

    it('Page: my account:insurance:auto fnol:loadefnol', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.BehindLoginEntry }) as any
      );

      const { result } = renderHook(() => useTagging());

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.BEHIND_LOGIN, POLICY_NUMBER),
        ins_policy: ['ATX'],
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:auto fnol:loadefnol',
        product: ['driven:impact with an animal'],
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
    });

    it('Page: my account:insurance:auto fnol:customreporter', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.CustomReporter }) as any
      );

      const { result } = renderHook(() => useTagging());

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.BEHIND_LOGIN, POLICY_NUMBER),
        ins_policy: ['ATX'],
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:auto fnol:customreporter',
        product: ['driven:impact with an animal'],
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
    });

    it('Page: my account:insurance:auto fnol:incidentdetails', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.WhenAccident }) as any
      );

      const { result } = renderHook(() => useTagging());

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.BEHIND_LOGIN, POLICY_NUMBER),
        ins_policy: ['ATX'],
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:auto fnol:incidentdetails',
        product: ['driven:impact with an animal'],
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
    });

    it('Page: my account:insurance:auto fnol:whereaccident', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.WhereAccident }) as any
      );

      const { result } = renderHook(() => useTagging());

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.BEHIND_LOGIN, POLICY_NUMBER),
        ins_policy: ['ATX'],
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:auto fnol:whereaccident',
        product: ['driven:impact with an animal'],
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
    });

    it('Page: my account:insurance:auto fnol:customdriver', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.CustomDriver }) as any
      );

      const { result } = renderHook(() => useTagging());

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.BEHIND_LOGIN, POLICY_NUMBER),
        ins_policy: ['ATX'],
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:auto fnol:customdriver',
        product: ['driven:impact with an animal'],
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
    });

    it('Page: my account:insurance:auto fnol:customvehicle', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.CustomVehicle }) as any
      );

      const { result } = renderHook(() => useTagging());

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.BEHIND_LOGIN, POLICY_NUMBER),
        ins_policy: ['ATX'],
        flow: 'driven:impact with an animal',
        page: 'my account:insurance:auto fnol:customvehicle',
        product: ['driven:impact with an animal'],
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop'
      });
    });
  });

  describe('Custom page tag', () => {
    it('should use the custom page tag', async () => {
      vi.spyOn(Router, 'useLocation').mockImplementation(
        () => ({ pathname: Pages.GlassDamage }) as any
      );

      const { result } = renderHook(() => useTagging(true, 'custom-page-tag'));

      expect(result.current.tags).toEqual({
        ...commonTags(LoginFlowType.ANONYMOUS, POLICY_NUMBER),
        ins_policy: ['ATX'],
        page: 'my account:insurance:easy auto fnol:custom-page-tag',
        flow: 'driven:impact with an animal',
        text_opt_in: 'true',
        ins_claim_id: '123456789',
        platform: 'desktop',
        product: ['driven:impact with an animal']
      });
    });
  });
});
