export const LISTENING_EXERCISES = [
  // Animals
  { id:'l_a1', topic:'animals', type:'listen_choose',
    text:'This animal is big and grey. It has a very long nose called a trunk.',
    options:['🐘','🦒','🐻'], correct:0, optionLabels:['elephant','giraffe','bear'] },
  { id:'l_a2', topic:'animals', type:'dictation_lite',
    text:'The cat is sleeping on the sofa.',
    words:['The','cat','is','sleeping','on','the','sofa'] },

  // Food
  { id:'l_f1', topic:'food', type:'listen_choose',
    text:'It is yellow. Monkeys love to eat it. You need to peel it first.',
    options:['🍎','🍌','🍊'], correct:1, optionLabels:['apple','banana','orange'] },
  { id:'l_f2', topic:'food', type:'listen_answer',
    text:'Tom says: What do you want for breakfast? Anna says: I want some bread and an egg, please.',
    question:'What does Anna want for breakfast?',
    options:['Pizza and milk','Bread and an egg','Rice and soup'], correct:1 },

  // Sports
  { id:'l_s1', topic:'sports', type:'listen_choose',
    text:'You do this sport in water. You use your arms and legs to move through the water.',
    options:['⚽','🏊','🎾'], correct:1, optionLabels:['football','swimming','tennis'] },
  { id:'l_s2', topic:'sports', type:'dictation_lite',
    text:'She likes playing basketball after school.',
    words:['She','likes','playing','basketball','after','school'] },

  // School
  { id:'l_sc1', topic:'school', type:'listen_choose',
    text:'You use this to draw straight lines. It is long and flat. Teachers use it too.',
    options:['✏️','📏','✂️'], correct:1, optionLabels:['pencil','ruler','scissors'] },
  { id:'l_sc2', topic:'school', type:'listen_answer',
    text:'The teacher says: Open your books to page ten. Take out your pencils. We have a test today.',
    question:'What are the students going to do?',
    options:['Draw a picture','Have a test','Read a story'], correct:1 },

  // Family
  { id:'l_fa1', topic:'family', type:'listen_choose',
    text:"She is your father's mother. She is older and loves to cook delicious food.",
    options:['👩','👵','👧'], correct:1, optionLabels:['mother','grandmother','sister'] },
  { id:'l_fa2', topic:'family', type:'dictation_lite',
    text:'My brother and sister go to the same school.',
    words:['My','brother','and','sister','go','to','the','same','school'] },

  // Clothes
  { id:'l_cl1', topic:'clothes', type:'listen_choose',
    text:'You wear these on your feet when it is cold and rainy outside. They are tall boots.',
    options:['👟','🥾','👡'], correct:1, optionLabels:['shoes','boots','sandals'] },
  { id:'l_cl2', topic:'clothes', type:'listen_answer',
    text:"Mia says: What are you wearing today? Leo says: I'm wearing a blue jacket and black trousers.",
    question:"What colour is Leo's jacket?",
    options:['Black','Green','Blue'], correct:2 },

  // Places
  { id:'l_pl1', topic:'places', type:'listen_choose',
    text:'You go here when you are sick or hurt. Doctors and nurses work here to help people.',
    options:['🏫','🏥','🏦'], correct:1, optionLabels:['school','hospital','bank'] },
  { id:'l_pl2', topic:'places', type:'dictation_lite',
    text:'We went to the zoo on Saturday.',
    words:['We','went','to','the','zoo','on','Saturday'] },

  // Transport
  { id:'l_tr1', topic:'transport', type:'listen_choose',
    text:'This vehicle flies very high in the sky. It is very fast and can carry many passengers.',
    options:['🚗','✈️','🚢'], correct:1, optionLabels:['car','plane','ship'] },
  { id:'l_tr2', topic:'transport', type:'listen_answer',
    text:'Dad asks: How do you go to school? Ben says: I usually go by bus, but today Mum drives me by car.',
    question:'How does Ben usually go to school?',
    options:['By car','By train','By bus'], correct:2 },

  // Weather
  { id:'l_w1', topic:'weather', type:'listen_choose',
    text:'Today the sky is grey and water is falling down from the clouds. Take your umbrella!',
    options:['☀️','🌧️','❄️'], correct:1, optionLabels:['sunny','rainy','snowy'] },
  { id:'l_w2', topic:'weather', type:'dictation_lite',
    text:'It is very cold and windy today.',
    words:['It','is','very','cold','and','windy','today'] },

  // Body
  { id:'l_b1', topic:'body', type:'listen_choose',
    text:'You use these to see things. They are on your face, above your nose.',
    options:['👂','👀','👃'], correct:1, optionLabels:['ears','eyes','nose'] },
  { id:'l_b2', topic:'body', type:'listen_answer',
    text:'The doctor asks: Where does it hurt? The child says: My stomach hurts and my head feels very hot.',
    question:'What hurts the child?',
    options:['Arm and leg','Stomach and head','Eyes and ears'], correct:1 },

  // Colors
  { id:'l_co1', topic:'colors', type:'listen_choose',
    text:'This is the colour of the sky on a beautiful sunny day. It is also the colour of the ocean.',
    options:['🔴','🔵','🟢'], correct:1, optionLabels:['red','blue','green'] },
  { id:'l_co2', topic:'colors', type:'dictation_lite',
    text:'The flowers are pink and yellow.',
    words:['The','flowers','are','pink','and','yellow'] },

  // Numbers
  { id:'l_n1', topic:'numbers', type:'listen_choose',
    text:'This number comes after nine and before eleven. Count on your fingers to find it!',
    options:['8️⃣','🔟','7️⃣'], correct:1, optionLabels:['eight','ten','seven'] },
  { id:'l_n2', topic:'numbers', type:'listen_answer',
    text:'The shop assistant says: That is fifteen pounds please. The child gives twenty pounds. The shop assistant says: Your change is five pounds.',
    question:'How much change does the child get?',
    options:['Ten pounds','Five pounds','Fifteen pounds'], correct:1 },
];
