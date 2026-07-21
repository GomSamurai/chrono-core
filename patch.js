const fs = require('fs');
let code = fs.readFileSync('src/hooks/useGameEngine.ts', 'utf8');

// Replace CPU_REACTION with P2/CPU logic
code = code.replace(
  `  const [activeDirection, setActiveDirection] = useState<Direction>('NONE');`,
  `  const [activeDirection, setActiveDirection] = useState<Direction>('NONE');\n  const [p2ActiveDirection, setP2ActiveDirection] = useState<Direction>('NONE');`
);
code = code.replace(
  `  const [chargeLevel, setChargeLevel] = useState(0);`,
  `  const [chargeLevel, setChargeLevel] = useState(0);\n  const [p2ChargeLevel, setP2ChargeLevel] = useState(0);`
);
code = code.replace(
  `  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null);`,
  `  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null);\n  const p2ChargeTimerRef = useRef<NodeJS.Timeout | null>(null);`
);

fs.writeFileSync('src/hooks/useGameEngine.ts', code);
