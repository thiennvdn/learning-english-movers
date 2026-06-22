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

  // ── MOVERS+ EXTRA EXERCISES ────────────────────────────────────────────────

  // Animals (Movers+)
  { id:'l_a3', topic:'animals', type:'listen_answer',
    text:'Zookeeper says: The lion is the king of the jungle. It is a big cat with a golden mane. Lions live in Africa and they hunt in groups called prides.',
    question:'What do lions hunt in?',
    options:['Pairs','Groups called prides','Families of two'], correct:1 },
  { id:'l_a4', topic:'animals', type:'dictation_lite',
    text:'The penguin cannot fly but it can swim very fast.',
    words:['The','penguin','cannot','fly','but','it','can','swim','very','fast'] },

  // Food (Movers+)
  { id:'l_f3', topic:'food', type:'listen_answer',
    text:'Waiter says: Good evening! Our special tonight is grilled chicken with rice and salad. For dessert we have chocolate cake or ice cream.',
    question:'What is the dessert choice?',
    options:['Fruit salad or pie','Chocolate cake or ice cream','Pudding or biscuits'], correct:1 },
  { id:'l_f4', topic:'food', type:'dictation_lite',
    text:'She always has cereal and orange juice for breakfast.',
    words:['She','always','has','cereal','and','orange','juice','for','breakfast'] },

  // Sports (Movers+)
  { id:'l_s3', topic:'sports', type:'listen_answer',
    text:'Sports reporter says: It was an exciting match! The home team scored two goals in the first half. In the second half, the visiting team scored three goals and won the match.',
    question:'Who won the match?',
    options:['The home team','A draw','The visiting team'], correct:2 },
  { id:'l_s4', topic:'sports', type:'dictation_lite',
    text:'My brother runs five kilometres every morning before school.',
    words:['My','brother','runs','five','kilometres','every','morning','before','school'] },

  // School (Movers+)
  { id:'l_sc3', topic:'school', type:'listen_answer',
    text:'Teacher says: Class, tomorrow we have a science project. You need to bring a bottle, some vinegar, and baking soda. We are going to make a volcano!',
    question:'What are the students going to make?',
    options:['A robot','A volcano','A rocket'], correct:1 },
  { id:'l_sc4', topic:'school', type:'dictation_lite',
    text:'The library is open every day except Sunday.',
    words:['The','library','is','open','every','day','except','Sunday'] },

  // Family (Movers+)
  { id:'l_fa3', topic:'family', type:'listen_answer',
    text:'Emma says: I have a big family. My parents have four children — two boys and two girls. I am the oldest. My youngest brother is only three years old.',
    question:'How old is Emma\'s youngest brother?',
    options:['One year old','Three years old','Five years old'], correct:1 },
  { id:'l_fa4', topic:'family', type:'dictation_lite',
    text:'My grandparents live in a small house by the sea.',
    words:['My','grandparents','live','in','a','small','house','by','the','sea'] },

  // Clothes (Movers+)
  { id:'l_cl3', topic:'clothes', type:'listen_answer',
    text:'Shop assistant says: Can I help you? Customer says: Yes please. I need a coat for my daughter. She is eight years old. Shop assistant says: We have red ones and blue ones. Customer says: She loves blue, so we will take the blue one.',
    question:'What colour coat does the customer choose?',
    options:['Red','Green','Blue'], correct:2 },
  { id:'l_cl4', topic:'clothes', type:'dictation_lite',
    text:'He wore his new yellow raincoat because it was raining outside.',
    words:['He','wore','his','new','yellow','raincoat','because','it','was','raining','outside'] },

  // Places (Movers+)
  { id:'l_pl3', topic:'places', type:'listen_answer',
    text:'Tour guide says: Welcome to the museum! On the ground floor you will see dinosaur skeletons. On the first floor there are paintings from famous artists. The café is in the basement.',
    question:'Where are the dinosaur skeletons?',
    options:['First floor','Basement','Ground floor'], correct:2 },
  { id:'l_pl4', topic:'places', type:'dictation_lite',
    text:'The park is next to the supermarket on Green Street.',
    words:['The','park','is','next','to','the','supermarket','on','Green','Street'] },

  // Transport (Movers+)
  { id:'l_tr3', topic:'transport', type:'listen_answer',
    text:'Announcer says: Attention passengers. The train to Manchester is delayed by twenty minutes. It will now depart from platform three at half past four. We are sorry for the delay.',
    question:'How long is the train delayed?',
    options:['Ten minutes','Twenty minutes','Thirty minutes'], correct:1 },
  { id:'l_tr4', topic:'transport', type:'dictation_lite',
    text:'The red bus stops outside the school at eight fifteen.',
    words:['The','red','bus','stops','outside','the','school','at','eight','fifteen'] },

  // Weather (Movers+)
  { id:'l_w3', topic:'weather', type:'listen_answer',
    text:'Weather forecast: Good morning! Today will be cloudy in the morning with some light rain in the afternoon. Tomorrow will be much better — sunny and warm with temperatures of twenty degrees.',
    question:'What will the weather be like tomorrow?',
    options:['Cloudy and cold','Rainy all day','Sunny and warm'], correct:2 },
  { id:'l_w4', topic:'weather', type:'dictation_lite',
    text:'The storm last night was the strongest one this year.',
    words:['The','storm','last','night','was','the','strongest','one','this','year'] },

  // Body (Movers+)
  { id:'l_b3', topic:'body', type:'listen_answer',
    text:'Nurse says: You need to exercise to keep your body healthy. Try to walk for thirty minutes every day. Eat lots of fruit and vegetables. And remember to get eight hours of sleep every night!',
    question:'How long should you walk every day?',
    options:['Ten minutes','Twenty minutes','Thirty minutes'], correct:2 },
  { id:'l_b4', topic:'body', type:'dictation_lite',
    text:'She hurt her knee when she fell off her bicycle.',
    words:['She','hurt','her','knee','when','she','fell','off','her','bicycle'] },

  // Colors (Movers+)
  { id:'l_co3', topic:'colors', type:'listen_answer',
    text:'Art teacher says: Today we are going to mix colours! If you mix red and blue, you get purple. Red and yellow make orange. And blue and yellow make green. Let\'s try it!',
    question:'What do you get when you mix red and yellow?',
    options:['Purple','Orange','Green'], correct:1 },
  { id:'l_co4', topic:'colors', type:'dictation_lite',
    text:'The rainbow has seven different colours from red to violet.',
    words:['The','rainbow','has','seven','different','colours','from','red','to','violet'] },

  // Numbers (Movers+)
  { id:'l_n3', topic:'numbers', type:'listen_answer',
    text:'Maths teacher says: There are thirty students in Class 4B. Twelve of them are girls. How many are boys? Remember to subtract the girls from the total number of students.',
    question:'How many boys are in Class 4B?',
    options:['Fourteen','Sixteen','Eighteen'], correct:2 },
  { id:'l_n4', topic:'numbers', type:'dictation_lite',
    text:'She scored ninety five out of a hundred in her English test.',
    words:['She','scored','ninety','five','out','of','a','hundred','in','her','English','test'] },
];
