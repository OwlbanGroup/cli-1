# Owlban Group Unlimited Access Implementation

## Tasks

- [ ] Add AuthType.OWL_BAN_UNLIMITED to contentGenerator.ts
- [ ] Create BlackboxOwlbanOAuth2Client class with unlimited endpoints in blackboxOAuth2.ts
- [ ] Modify getBlackboxOAuthClient to return Owlban client for unlimited auth type
- [ ] Update CLI auth selection to include Owlban Group option
- [ ] Test the implementation

## Information Gathered

- Owlban Group = Owners organization
- Current Blackbox OAuth has rate limits (60 req/min, 2000/day)
- Rate limits are server-side, so client assumes different endpoints for unlimited access
- Need to modify authentication flow (option 2)

## Plan

1. Add new AuthType for Owlban unlimited access
2. Create separate OAuth client with different base URLs
3. Update auth selection in CLI
4. Assume server-side endpoints handle unlimited access
