import { nextUint64, splitMix64, substream, substreamSeed, unitIntervalAt } from '../../domain/market/prng';
import { priceTick } from '../../domain/market/price-engine';

describe('Deterministic price engine', () => {
  it('replays identical outputs for the same inputs', () => {
    for (let tickIndex = 0; tickIndex < 80; tickIndex += 1) {
      const input = {
        rootSeed: 'phase-0-root',
        instrumentSeed: 'NYX',
        marketConfigVersion: 'p1-v1',
        tickIndex,
      };
      expect(priceTick(input)).toEqual(priceTick(input));
    }
  });

  it('changes streams by instrument and config without changing replay stability', () => {
    const nyx = priceTick({
      rootSeed: 'root',
      instrumentSeed: 'NYX',
      marketConfigVersion: 'p1-v1',
      tickIndex: 42,
    });
    const qbt = priceTick({
      rootSeed: 'root',
      instrumentSeed: 'QBT',
      marketConfigVersion: 'p1-v1',
      tickIndex: 42,
    });
    const nextConfig = priceTick({
      rootSeed: 'root',
      instrumentSeed: 'NYX',
      marketConfigVersion: 'p1-v2',
      tickIndex: 42,
    });

    expect(qbt).toEqual(priceTick({
      rootSeed: 'root',
      instrumentSeed: 'QBT',
      marketConfigVersion: 'p1-v1',
      tickIndex: 42,
    }));
    expect(nyx.mark).not.toBe(qbt.mark);
    expect(nyx.mark).not.toBe(nextConfig.mark);
  });

  it('named substreams do not perturb canonical price replay', () => {
    const before = priceTick({
      rootSeed: 'root',
      instrumentSeed: 'VLTA',
      marketConfigVersion: 'p1-v1',
      tickIndex: 64,
    });

    const participantStream = substream('root', 'VLTA', 'participants');
    const newsStream = substream('root', 'VLTA', 'news');
    const participantStep = nextUint64(participantStream);
    const newsStep = nextUint64(newsStream);

    expect(participantStep.value).not.toBe(newsStep.value);
    expect(substreamSeed('root', 'VLTA', 'participants')).not.toBe(substreamSeed('root', 'VLTA', 'news'));
    expect(unitIntervalAt(participantStep.state.state, 10)).not.toBe(unitIntervalAt(newsStep.state.state, 10));

    const after = priceTick({
      rootSeed: 'root',
      instrumentSeed: 'VLTA',
      marketConfigVersion: 'p1-v1',
      tickIndex: 64,
    });
    expect(after).toEqual(before);
  });

  it('keeps dayOpen stable within a session and moves at the session boundary', () => {
    const root = {
      rootSeed: 'root',
      instrumentSeed: 'SABL',
      marketConfigVersion: 'p1-v1',
    };
    const first = priceTick({ ...root, tickIndex: 391 });
    const second = priceTick({ ...root, tickIndex: 450 });
    const nextSession = priceTick({ ...root, tickIndex: 780 });

    expect(first.session.sessionIndex).toBe(1);
    expect(first.dayOpen).toBe(second.dayOpen);
    expect(nextSession.session.sessionIndex).toBe(2);
    expect(nextSession.dayOpen).not.toBe(first.dayOpen);
  });
});
