{
  lib,
  mkShell,
  alejandra,
  bash,
  nodejs,
  bun,
  docker-compose,
  wrangler,
  includeWrangler ? true,
}:
mkShell rec {
  name = "sdk-test";

  packages =
    [
      bash
      nodejs
      bun

      docker-compose

      # Required for CI for format checking.
      alejandra
    ]
    # Orbs use the locked npm CLI instead of rebuilding Wrangler in Nix.
    ++ lib.optional includeWrangler wrangler;
}
