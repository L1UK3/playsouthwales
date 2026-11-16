# Play! South Wales Domain Context

Play! South Wales connects Pokémon Trading Card Game and Video Game Championship communities across South Wales, tracking local leagues, regional schedules, and competitive player standings.

## Language

### Competitions & Standings

**National Rankings**:
The competitive leaderboard ranking Welsh players by official Championship Points (CP) across premier circuit events.
_Avoid_: Local standings, store leaderboard, circuit standings

**Local Standings**:
The cumulative match results (wins, losses, draws, attendance, and league points) tracked for players within a single local game store or league, submitted manually via Admin session summaries. Never scraped.
_Avoid_: National rankings, top 20, championship rankings

**Championship Series**:
The official Pokémon competitive circuit comprising Regional, International, and World Championship events, represented as a dedicated umbrella league entity.
_Avoid_: Store league, local league

### Access & Community Integration

**Admin Authentication**:
Clerk authentication restricted strictly to tournament organizers and platform administrators. No public player profiles or account registration exist.
_Avoid_: User profile, player account, login for users

**Community Discord Broadcast**:
Automated Discord bot announcements to central server channels. Triggers instant alerts for premier events (Championship Series, League Cups, League Challenges) and dispatches a weekly schedule digest every Sunday.
_Avoid_: Per-store bot subscriptions, decklist alerts
