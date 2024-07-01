// The code can be executed using Nodejs ,as node dinnerspace.js
function findID (name,entries){ const object = entries.find(obj => obj.name === name);
    return object.id}
  function findObjectDC (dc){ for (let jj= 0;jsonData.dcs.length - 1; jj ++ ){if ( jsonData.dcs[jj].id  == dc) return jsonData.dcs[jj] ;break} }
      
  
   function logexec_address(exs){
    var opstring ='';
    exs.forEach(element => {
      
     opstring = opstring + element +'.'
    });
     console.log('execution address string:' + opstring)
  
   }
  
  const prompt = require('prompt-sync')({sigint: true});
  function prompt_PnR(PnR)
  {
    // Get user input
    let ans = prompt(PnR.question);
    
    PnR.answer = ans
    
     return PnR;
  }
  
  function getAnswer(PnR,q){ for (let i=0;i<PnR.length;i++){if (PnR[i].question === q) return PnR[i].answer; }}
  function addAnswer(PnR,q){ PnR.push(q);return PnR}
  function updateAnswer(PnR,qa){ //console.log("update:"+ JSON.stringify(PnR)+"qa"+JSON.stringify(qa));
   for (let i=0;i<PnR.length;i++)
   {if (PnR[i].question === qa.question)  PnR[i].answer= qa.answer; }}
  
     
  //prompt_PnR(PnR);
  function pick_answer(flow,PnR){
    const { question, answer } = PnR
    var answerExists = false
     if (answer != '_') {answerExists = true}
      if (!answerExists) {
        const rqa= prompt_PnR(PnR);
        flow.some((q) => {if(q.question === rqa.question){q.answer = rqa.answer} });
      
    }
    return flow;
  }
  const flowFirst= (first,second)=> {
    const mergedResult = [...first];
  
  // Add questions from the second array to the merged result if they don't exist in the first array
  for (const { question, answer } of second) {
    const questionExists = mergedResult.some((q) => q.question === question);
    if (!questionExists) {
      mergedResult.push({ question, answer });
    }
  }
  
  
  return mergedResult;
  }
  
  function fill_nullanswer(flow,PnR) {
      for (const { question, answer } of PnR) {
      if (answer=='_'){flow = pick_answer(flow,{question,answer});
                   // console.log("picked flow"+JSON.stringify(flow))
  
                               };
      }
    }
    
  //* DC Custom code 
  function dc4_invoke(flow,q) {
  
      const type = getAnswer(flow,q);
      const vegDishes = ['Veg-Curry', 'Paneer-Tikka', 'Vegetable-Biryani'];
      const nonVegDishes = ['Chicken-Curry', 'Fish-Fry', 'Mutton-Biryani'];
    
      const dishes = type === 'veg' ? vegDishes : nonVegDishes;
      const randomIndex = Math.floor(Math.random() * dishes.length);
      const q1 = {"question":"dinner for","answer" : getAnswer(flow,"what is your name")};
      const q2 = {"question":"dish selected","answer": dishes[randomIndex]};
      
      updateAnswer(flow,q1)
      updateAnswer(flow,q2)
      return dishes[randomIndex];
    }
   
   function dc3_invoke (flow,q){const nq = {"question":"dish presented","answer":getAnswer(flow,q)};updateAnswer(flow,nq);} // present_food();}
   function dc2_invoke (flow,q){  const nq = {"question":"dish made","answer":getAnswer(flow,q)};updateAnswer(flow,nq);}
   function dc1_invoke (flow,PnR){fill_nullanswer(flow,PnR); 
  }
     
    
  //* Intention Space in JSON
  
  const jsonData = {
    objects: [
      {id:"ob1", name: "Dining Space", reflectors: [{ receives: "I want dinner", reflects: "Schedule a dinner plate" }] },
      {id:"ob2", name: "Weekly schedule", reflectors: [{ receives: "Schedule a dinner plate", reflects: "Prepare a dinner plate" }] },
      {id:"ob3", name: "Dinner Plate", reflectors: [{ receives: "Prepare a dinner plate", reflects: "Present a dinner plate" }] },
    ],
    intentions: [
      { id:"in1",name: "I want dinner", PnR: [] },
      { id:"in2",name: "Schedule a dinner plate", PnR: [] },
      { id:"in3",name: "Prepare a dinner plate", PnR: [] },
      { id:"in4", name: "Present a dinner plate", PnR: [] },
    ],
    dcs: [
      {id:"dc1", name: "Requesting dinner ", emits: [{ intention: "I want dinner", Object: 'Dining Space' }], receives:[ { intention: "I want dinner", Object: "none" }] ,
      PnR:[{ question: "what is your name", answer: "_" },{ question: "do you have veg or non veg", answer: "_" }],
      invoke:'dc1_invoke(flow,dc.PnR)'},
      {id:"dc5", name: "Requesting a drink ", emits: [{ intention: "I want a drink", Object: 'Dining Space' }], receives: null },
      {id:"dc4", name: "Scheduling a dinner", emits: [{ intention: "Schedule a dinner plate", Object: 'Weekly schedule' }], receives: [{ intention: "Schedule a dinner plate", Object: 'Dining Space' }],
      invoke:'dc4_invoke(flow,"do you have veg or non veg")',
      PnR:[{ question: "dinner for", answer: "_" },{ question: "dish selected", answer: "_" }], },
      {id:"dc2", name: "Preparing a dinner", emits: [{ intention: "Prepare a dinner plate", Object: 'Dinner Plate' }], receives: [{ intention: "Prepare a dinner plate", Object: 'Weekly schedule' }],
      PnR:[{ question: "dish made", answer: "_" }], 
      invoke:'dc2_invoke(flow,"dish selected")',},  
      {id:"dc3", name: "Presenting a dinner", emits: null, receives: [{ intention: "Present a dinner plate", Object: 'Dinner Plate' }],
      PnR:[{ question: "dish presented", answer: "_" }], 
      invoke:'dc3_invoke(flow,"dish made")'} 
    ],
  };
  
  //* Intention Space sample execution
     
     // an Intention starts the flow
     function Invoke_intention(startin,PnR) {
    
      const dc = jsonData.dcs.find(dc => dc.receives && 
                                        dc.receives.some(receiver => receiver.intention === startin && 
                                          receiver.Object === 'none'));
           ci=[];ci.push(startin)
           Invoke_design_chunk(dc.name,ci);
     }
     
     // start a DC
  
     function Invoke_design_chunk(startdc,ci=[], sequence = [],opseq = [],flow=[],exec_address=[]) {
     const dc = jsonData.dcs.find(dc => dc.name === startdc);
      if (!dc) {
        console.log(`DC '${startdc}' not found.`);
        return;
      }
        opseq.push('ci:'+ ci) 
        exec_address.push(dc.id);
  
    // flow first merges the flow PnR with the PnR of the current DC
  
         flow = flowFirst(flow,dc.PnR);
          
     //invoke methods in the DC
     
     eval(dc.invoke);
    
     
     // find the emit from current DC and determine what object it hits
     // and which DC it reflects to,for scheduling next DC
     opseq.push('dc:'+ dc.name)
      if (dc.emits && dc.emits.length > 0) {
        const emit = dc.emits[0]; // pick top emit,for simplicity
        exec_address.push(findID(emit.intention, jsonData.intentions));
        opseq.push('ei:'+ emit.intention) 
        const { intention, Object } = emit;
        opseq.push('ob:'+ emit.Object) 
        exec_address.push(findID(emit.Object, jsonData.objects));
      
        const object = jsonData.objects.find(obj => obj.name === Object);
        if (!object) {
          console.log(`Object '${Object}' not found.`);
          return;
        }
        const reflector = object.reflectors.find(ref => ref.receives === intention);
        if (!reflector) {
          console.log(`Reflector not found for intention '${intention}' and object '${Object}'.`);
          return;
        }
        opseq.push('ri:'+ reflector.reflects) 
        exec_address.push(findID(reflector.reflects, jsonData.intentions));
      
        const nextDC = jsonData.dcs.find(dc => dc.receives && dc.receives.some(receiver => receiver.intention === reflector.reflects && receiver.Object === Object));
       
        if (!nextDC) {
          console.log(`Next DC not found for intention '${reflector.reflects}' and object '${Object}'.`);
          return;
        }
  // at this point, the next DC has to be executed
        sequence.push({
          DC: startdc,
          Intention: intention,
          Object,
          ReflectedIntention: reflector.reflects
        });
        ci=[];ci.push(nextDC.receives[0].intention)
        Invoke_design_chunk(nextDC.name,ci, sequence,opseq,flow,exec_address); // Recursive call with the next DC
      } else {
        sequence.push({
          DC: startdc,
          Intention: null,
          Object: null,
          ReflectedIntention: null
        });
    
        console.log(`No further emit defined for DC '${startdc}'.`);
        
        console.log("operation Sequence:", opseq);
        console.log("accumulated flow PnR:", flow);
       
        logexec_address(exec_address);
      }
    }
     
    //* Usage:
    Invoke_intention('I want dinner');
  
   
