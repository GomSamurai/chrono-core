import fs from 'fs';
let code = fs.readFileSync('src/hooks/useGameEngine.ts', 'utf8');

// Export turnState
code = code.replace(
  'p2ActiveDirection, p2ChargeLevel, p2StartCharge, p2CancelCharge, p2ExecuteAction\n  };',
  'p2ActiveDirection, p2ChargeLevel, p2StartCharge, p2CancelCharge, p2ExecuteAction,\n    turnState\n  };'
);

fs.writeFileSync('src/hooks/useGameEngine.ts', code);
