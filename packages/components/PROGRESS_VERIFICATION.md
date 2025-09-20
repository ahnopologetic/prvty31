# Progress Behavior Verification

## Expected Behavior

The analog timer should work like a traditional kitchen timer:

### Initial State Examples:
- **25 minutes**: Arc goes from 12 o'clock to 5 o'clock position (150°)
- **15 minutes**: Arc goes from 12 o'clock to 3 o'clock position (90°)  
- **30 minutes**: Arc goes from 12 o'clock to 6 o'clock position (180°)
- **45 minutes**: Arc goes from 12 o'clock to 9 o'clock position (270°)

### As Time Decreases:
The arc should shrink from the end position back toward 12 o'clock.

### Calculation Verification:
For a timer set to X minutes:
- Initial angle = (X / 60) * 360°
- Remaining angle = (remainingSeconds / 3600) * 360°
- Arc always starts at 12 o'clock (-90°) and ends at remaining angle

### Examples:
1. **25-minute timer at start**: 
   - remainingSeconds = 1500
   - remainingAngle = (1500 / 3600) * 360° = 150°
   - Arc from -90° to 60° (12 o'clock to 5 o'clock)

2. **25-minute timer at 10 minutes left**:
   - remainingSeconds = 600  
   - remainingAngle = (600 / 3600) * 360° = 60°
   - Arc from -90° to -30° (12 o'clock to 2 o'clock)

3. **25-minute timer at completion**:
   - remainingSeconds = 0
   - remainingAngle = 0°
   - No arc (empty)

This matches the traditional kitchen timer behavior where you can see how much time is left by looking at the colored arc.
