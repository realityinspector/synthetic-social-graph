# Synthetic Social Graph

Interactive laboratory for [The Synthetic Social Graph Theorem](https://github.com/realityinspector/synthetic-social-graph-paper) by [Sean McDonald](https://x.com/seanmcdonaldxyz).

Twenty-two identity tensors settle under an energy field. Bonds form when attraction outweighs value conflict and status clash. Every proposed move is scored by identity, relation, time, and behavior validators. Accepted changes, pulses, shocks, and refusals append to a clockchain.

This is an instrument for reading the paper. It is not a proof and it is not an empirical claim.

## Run

```bash
npm install
npm run dev
```

The field opens at `http://127.0.0.1:8080`.

## What you can do

- Run, pause, or step the field.
- Drag an agent. A move the relation validator rejects snaps back and is logged.
- Seed a protest wave, market shock, or festival pulse.
- Raise validation threshold θ and watch refusals fill the clockchain.
- Reseed the population.

## Model

The step is a damped projection toward lower energy, accepted only when every validator clears θ:

```
Xₜ₊₁ = (1 − αₜ) Xₜ + αₜ Π(arg minᵧ E(Y) + ηₜ)
E(Y) = Σᵢ wᵢ φᵢ(Y) + Σᵢⱼ Jᵢⱼ ψᵢⱼ(Yᵢ, Yⱼ)
```

Each agent is a 4×4 identity tensor (demographic, psychographic, behavioral, relational). Behavior is an ADPRS envelope: amplitude, decay, duration, period, spread.

## Status

Untested, unvetted pre-publication reading. February 2025 paper. The clockchain here is a chained digest, a stand-in for the paper’s cryptographic DAG, not a ledger.
