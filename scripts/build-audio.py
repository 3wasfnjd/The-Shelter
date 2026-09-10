"""Original synthesized bunker feedback, mono PCM for predictable browser decoding."""
import wave,math,random,struct
from pathlib import Path
out=Path('public/assets/audio');out.mkdir(parents=True,exist_ok=True)
rate=22050
specs={'ambience':(4,45),'generator-start':(2,55),'electrical-hum':(2,60),'ventilation':(3,95),'relay':(.08,720),'valve':(.3,140),'pressure':(3,180),'confirm':(.38,660),'error':(.3,160),'keypad':(.09,880),'bolts':(.4,92),'door':(5,55),'escape':(4,220)}
loops={'ambience','electrical-hum','ventilation','pressure','escape'}
for name,(duration,freq) in specs.items():
    rng=random.Random(name);values=[];filtered=0
    for i in range(int(rate*duration)):
        t=i/rate;n=rng.uniform(-1,1);filtered=.94*filtered+.06*n
        envelope=1 if name in loops else min(1,t/.008)*max(0,1-t/duration)**1.8
        tone=math.sin(2*math.pi*freq*t)
        if name=='confirm':tone=math.sin(2*math.pi*(660 if t<.18 else 880)*t)
        if name in ['ventilation','pressure','escape']:sample=filtered*.8+tone*.02
        elif name in ['relay','bolts','valve','door']:sample=n*.09+tone*.12+filtered*.5
        elif name=='generator-start':sample=math.sin(2*math.pi*(35*t+22*t*t))*.15+filtered*.3
        else:sample=tone*.1+filtered*.18
        # Seamless fades at loop boundaries keep initial hardware-friendly assets click-free.
        if name in loops:envelope=min(1,t/.08,(duration-t)/.08)
        values.append(int(max(-1,min(1,sample*envelope))*32767))
    with wave.open(str(out/(name+'.wav')),'wb') as stream:
        stream.setnchannels(1);stream.setsampwidth(2);stream.setframerate(rate);stream.writeframes(struct.pack('<'+'h'*len(values),*values))
print('13 original WAV effects/loops generated.')
