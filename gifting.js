class Gifting  {
    constructor(){
        this.state = {
            paymentPlan:'',
            flavor:[],
            flavorName:'',
            hasOption1:false,
            hasOption2:false,
            option1:null,
            option2:null,
            products:[],
            finalProduct:{},
            quantity:0,
            duration:0,
            oz:0,
            pricePerOne:0,
            includeMsg:false,
            msgText:'',
            subtotal:0,
            prepaidProductId:'',
            payAsYouGoProductId:'',
            threeMonthProdObj:{},
            sixMonthProdObj:{},
            twelveMonthProdObj:{},
            variantPrice:0
        }

        this.selectors = {
            form:"#GiftingForm",
            sections:{
                payment:".gifting-steps-payment__container",
                flavor:".gifting-steps-flavor__container",
                option1:".gifting-steps-grind__container",
                option2:".gifting-steps-caffeine__container",
                product:".gifting-steps-product__container",
                quantity:".gifting-steps-quantity__container",
                subscription:".gifting-steps-subscription__container",
                review:".gifting-steps-review__container",
                submit:".gifting-steps__submit--wrapper"
            },
            stepSpan:".gifting-steps__step-span",
            frequencyLegend:".frequency-legend-text-wrapper",
            prepaidLegend:".prepaid-legend-text-wrapper",
            prepaidSubheader:".gifting-steps-subscription__subheading",
            review:{
                subscription:".gifting-steps-review__choice.sub-type",
                coffee:".gifting-steps-review__choice.coffee",
                quantity:".gifting-steps-review__choice.quantity",
                duration:".gifting-steps-review__choice.duration",
                msgCheckbox:"#IncludeMessage",
                msg:".gifting-steps-review__text-area",
                subtotal:".gifting-steps__subtotal-price"
            },
            productOz:".gift-quantity-card__ounces-text",
            optionRadio1:"[data-option1-radio]",
            optionRadio2:"[data-option2-radio]",
            subscriptionSubtitle:".gift-sub-card__cost-text"
        }

        this.collections = {
            collection1:{},
            collection2:{},
            collection3:{}
        }

        //array for all the options within the products of the collection
        this.options = [];
        
        //array for options radio selector in dom
        this.domRadio1 = [];
        this.domRadio2 = [];

        
        // push selectors and if selector is present dont incrament step counter
        this.steps = [];
    }

    init(){
        //console.log(this.collections)
        //this.getOptionsFromDom();
        this.renderStep(this.steps.length + 1,this.selectors.sections.payment);
        this.getDomRadioOptions();
        
    }

    getDomRadioOptions(){
        let domRadio1El = document.querySelectorAll(this.selectors.optionRadio1);
        let domRadio2El = document.querySelectorAll(this.selectors.optionRadio2);

        domRadio1El.forEach( el =>{
            this.domRadio1.push(el.value);
        })

        domRadio2El.forEach( el =>{
            this.domRadio2.push(el.value);
        })

        console.log(this.domRadio2, this.domRadio1);
    }

    renderStep(stepNumber,parentSelector){
        if(this.steps.includes(parentSelector)){
            return
        }
        this.steps.push(parentSelector);
        let parent = document.querySelector(parentSelector);
        let stepSpan = parent.querySelector(this.selectors.stepSpan)
        if(stepSpan){
            stepSpan.innerHTML = `step ${stepNumber}:`
        }
    }

    stepsSplice(sectionSelector){
        let keepCheck = true;
        let keep = [];
        let cut = [];

        for(let i = 0; i < this.steps.length ; i++){
            if(this.steps[i] === sectionSelector ){
                keepCheck = false;
                keep.push(this.steps[i]);
            }else{
                if(keepCheck === true){
                    keep.push(this.steps[i]);
                } else {
                    cut.push(this.steps[i]);
                }
            }
        }

        this.steps = [...keep];

        //console.log(this.steps, 'sections to cut',cut);
        return cut;
    }

    getOptionsFromDom(){
        let options =  document.querySelectorAll("[data-option]")
        options.forEach(option =>{
            this.options.push(option.dataset.option);
        })
        //console.log(this.options);
    }

    hideSection(className){
        let element = document.querySelector(className);
        element.style.display = "none"
    }

    showSection(className, scroll = true, displayType = 'block' ){
        let element = document.querySelector(className);
        element.style.display = `${displayType}`;
        if(scroll){
            this.scrollIntoView(className);
        }
    }

    toggleGiftMessage(e,className){
        if(e.target.checked === true){
            document.getElementsByClassName(className)[0].style.display = 'block';
            this.state.includeMsg = true;
        } else {
            document.getElementsByClassName(className)[0].style.display = 'none';
            this.state.includeMsg = false;
        }

        //console.log(this.state)
    }

    handlePaymentPlanSelect(e){
        const { flavor,payment } = this.selectors.sections;
        //console.log(e);
        this.resetSections(this.stepsSplice(payment));

        this.state.paymentPlan = e.target.value;
        this.renderStep(this.steps.length + 1,flavor);
        this.showSection(flavor);
        //console.log(this.state);
        
    }

    handleFlavorSelect(e){
        //console.log(e);
        this.stateResetOnFlavorSelect(e)
        const {flavor, option1,option2,product, quantity, subscription, review,submit } =  this.selectors.sections;
        //let sectionsToReset = [option1,option2,product, quantity, subscription, review,submit];
        //this.resetSections( sectionsToReset);
        this.resetSections(this.stepsSplice(flavor));
        //update state with selected collection
        //find the collection with matching id
        Object.keys(this.collections).forEach(key=>{
            if(this.collections[key].id == e.target.value){
                this.state.flavor = this.collections[key];
                this.state.products = this.collections[key].products;
            }
        })
        this.state.flavorName = e.target.id;
        this.state.oz = e.target.dataset.oz;
        

        //console.log(this.state);
        this.resetOptionsArray();
        this.state.products.forEach(product =>{
            this.getOptionFromVariant(product);
        })
        this.filterProductDisplay()
        this.handleOptionSelect();

        console.log(this.state)
    }

    resetOptionsArray(){
        this.options = [];
    }

    resetSections(selectors){
        selectors.forEach(selector =>{
            let section = document.querySelector(selector);
            section.style.display = 'none';
            let inputs = section.querySelectorAll("input");
            inputs.forEach(input =>{
                input.checked = false;
            })
            //console.log(inputs)
            
        })
    }
    //handles which option to go to next
    // handleOptionSelect(){
    //     let option1Check = false;
    //     let option2Check = false;
    //     this.state.flavor.options.forEach(optionObj =>{
    //         if(optionObj.name == this.options[0]){
    //             option1Check = true;
    //         }
    //         if(optionObj.name == this.options[1]){
    //             option2Check = true;
    //         }
    //     })
    //     if(option1Check){
    //         this.showSection(this.selectors.sections.option1);
    //         this.renderStep(this.steps.length + 1,this.selectors.sections.option1);
    //     } else if(option2Check){
    //         this.showSection(this.selectors.sections.option2);
    //         this.renderStep(this.steps.length + 1,this.selectors.sections.option2);
    //     } else{
    //         this.showSection(this.selectors.sections.product);
    //         this.renderStep(this.steps.length + 1,this.selectors.sections.product);
    //     }
    // }

    handleOptionSelect(){
        let check1 = true;
        let check2 = true;
        this.domRadio1.forEach(option =>{
            
            console.log(this.options, option,this.options.includes(option) )
            if(!this.options.includes(option)){
                check1 = false;
                console.log(this.state.hasOption1)
            }
        })

        this.domRadio2.forEach(option =>{
            if(!this.options.includes(option)){
                check2 = false;
                console.log(this.state.hasOption2)
            }
        })

        if(check1){
            this.state.hasOption1 = true;
        }

        if(check2){
            this.state.hasOption2 = true;
        }


        console.log(this.state)

        if(this.state.hasOption1 === true & this.state.option1 === null){
            this.showSection(this.selectors.sections.option1);
            this.renderStep(this.steps.length + 1,this.selectors.sections.option1);
        } else if(this.state.hasOption2 === true & this.state.option2 === null){
            this.showSection(this.selectors.sections.option2);
            this.renderStep(this.steps.length + 1,this.selectors.sections.option2);
        }else{
            this.showSection(this.selectors.sections.product);
            this.renderStep(this.steps.length + 1,this.selectors.sections.product);
        }
    }



    getOptionFromVariant(productObj){
        let variantArray = productObj.variants;
        let tempOptionsArray = [...this.options];

        if(variantArray.length > 0){
            variantArray.forEach(variant=>{
                variant.options.forEach(option =>{
                    if(!tempOptionsArray.includes(option)){
                        tempOptionsArray.push(option);
                    }

                })
            })
            this.options = [...tempOptionsArray];
            
        }
    }

    //find all the cards within the collection and set them to display block
    filterProductDisplay(){
        let productCards = document.querySelectorAll("[data-productID]");
        //console.log(productCards);
        productCards.forEach(card =>{
            //check to see if Id of product is in product state array
            let check = false;
            for(let i =0 ; i < this.state.products.length; i++){
                if(this.state.products[i].id == card.dataset.productid){
                    check = true;
                    //console.log('match!')
                }
            }
            if(check){
                card.style.display = 'block';
            } else{
                card.style.display = 'none';
            }
            
        })
    }

    stateResetOnFlavorSelect(){
        this.state.flavor = '';
        this.state.flavorName = '';
        this.state.hasOption1 = false;
        this.state.hasOption2 = false;
        this.state.option1 = null;
        this.state.option2 = null;
        this.state.products = [];
        this.state.finalProduct = {};
        this.state.quantity = 0;
        this.state.duration = 0;
        this.state.oz = 0;
        this.state.pricePerOne = 0;
        this.state.includeMsg = false;
        this.state.msgText = '';
        this.state.subtotal = 0;
        this.state.prepaidProductId = '';
        this.state.payAsYouGoProductId = '';
        this.state.threeMonthProdObj={};
        this.state.sixMonthProdObj = {};
        this.state.twelveMonthProdObj={};
        this.state.variantPrice = 0;
    }

    stateResetOnOptionSelect(){
        this.state.finalProduct = {};
        this.state.quantity = 0;
        this.state.duration = 0;
        this.state.pricePerOne = 0;
        this.state.includeMsg = false;
        this.state.msgText = '';
        this.state.subtotal = 0;
        this.state.prepaidProductId = '';
        this.state.payAsYouGoProductId = '';
        this.state.threeMonthProdObj={};
        this.state.sixMonthProdObj = {};
        this.state.twelveMonthProdObj={};
        this.state.variantPrice = 0;
    }

    handleOption1Select(e){
        const {option2, product, option1} = this.selectors.sections;

        this.resetSections(this.stepsSplice(option1));
        this.stateResetOnOptionSelect();
        
        this.state.option1 = e.target.value;
        //console.log(this.state);
        this.filterProductArrayByState();
        this.filterProductDisplay();
        if(this.state.hasOption2 === true){
            this.renderStep(this.steps.length + 1,this.selectors.sections.option2);
            this.showSection(option2);
        } else {
            this.renderStep(this.steps.length + 1,this.selectors.sections.product);
            this.showSection(product);
        }
        console.log(this.state);
    }

    handleOption2Select(e){
        const {product, option2 } = this.selectors.sections;
        this.stateResetOnOptionSelect();
        this.resetSections(this.stepsSplice(option2));
        this.state.option2 = e.target.value;
        this.filterProductArrayByState();

        this.renderStep(this.steps.length + 1,this.selectors.sections.product);
        this.showSection(product);


        this.filterProductDisplay();
        console.log(this.state);
    }

    filterProductArrayByState(){
        this.resetProductArray();

        if(this.state.option1 != null){
            this.filterProdcutsStateByOption(this.state.option1);
        }
        if(this.state.option2 != null){
            this.filterProdcutsStateByOption(this.state.option2);
        }

        if(this.state.option1 != null && this.state.option2 != null){
            this.filterProductsStateByBoth();
        }
    }

    filterProductsStateByBoth(){
        this.resetProductArray();

        let newProductsArray = this.state.products.filter(product=>{
            let check = false;
            product.variants.forEach(variant =>{
                let checkFor1 = variant.options.includes(this.state.option1);
                let checkFor2 = variant.options.includes(this.state.option2);
                
                let checkForTitle1 = this.state.option1 === "Ground" && variant.options.includes("Title");
                let checkForTitle2 = this.state.option2 === "Regular" && variant.options.includes("Title")
                if(checkFor1 && checkFor2){
                    check = true;
                } else if( checkForTitle1 && checkForTitle2){
                    check = true;
                } 
            })
            //console.log(product.options, optionName);
            return check;
        })

        this.state.products = [...newProductsArray];
        console.log(this.state.products);
    }

    filterProdcutsStateByOption(optionName){

        let newProductsArray = this.state.products.filter(product=>{
            let check = false;
            product.variants.forEach(variant =>{
                if(variant.options.includes(optionName)){
                    check = true;
                } else if(optionName === "Ground" && variant.options.includes("Title")){
                    check = true;
                } else if(optionName === "Regular" && variant.options.includes("Title")){
                    check = true;
                }
            })
            //console.log(product.options, optionName);
            return check;
        })

        this.state.products = [...newProductsArray];
    }

    handleProductSelect(e){
        const {quantity} = this.selectors.sections;
        if(this.state.paymentPlan == 'prepaid'){
            this.selectFinalProductFromState(e.target.value);
            this.handlePrepayProduct(e.target.value);
        }else{
            this.selectFinalProductFromState(e.target.value);
            let prodVariant = this.getVariant(this.state.finalProduct.variants);
            this.handlePayAsYouGoProduct();
            
        }
        this.state.pricePerOne = this.state.finalProduct.price;
        this.renderOz();
        this.renderStep(this.steps.length + 1,quantity);
        this.showSection(quantity);
    }

    

    selectFinalProductFromState(productId){
        const { products } = this.state;
        let finalProdArray = products.filter(product =>{
            return product.id == productId;
        })

        this.state.finalProduct = finalProdArray[0];
    }

    resetProductArray(){
        this.state.products = [...this.state.flavor.products];
    }

    handlePrepayProduct(productID){
        this.state.threeMonthProdObj = prepaid3Month[productID];
        this.state.sixMonthProdObj = prepaid6Month[productID];
        this.state.twelveMonthProdObj = prepaid12Month[productID];
        console.log(this.state);
    }

    getPrepayVariant(subLength){
        let variant;
        if(subLength === 3){
            variant = this.getVariant(this.state.threeMonthProdObj.variants);
        } else if(subLength === 6){
            variant = this.getVariant(this.state.sixMonthProdObj.variants);
            
        }else if(subLength === 9){
            variant = this.getVariant(this.state.twelveMonthProdObj.variants);
        }

        this.state.prepaidProductId = variant.id;
        this.state.variantPrice = variant.price;
        console.log(this.state);
    }

    getSubscriptionVariant(subLength){
        let variant;
        if(subLength === 3){
            variant = this.getVariant(this.state.threeMonthProdObj.variants);
        } else if(subLength === 6){
            variant = this.getVariant(this.state.sixMonthProdObj.variants);
            
        }else if(subLength === 9){
            variant = this.getVariant(this.state.twelveMonthProdObj.variants);
        }

        this.state.prepaidProductId = variant.id;
        this.state.variantPrice = variant.price;
        console.log(this.state);
    }

    handlePayAsYouGoProduct(productID){
        this.state.finalProduct.id
        let subVariant = payAsYouGoVariants[this.state.finalProduct.id];
        let variantObj = this.getVariant(this.state.finalProduct.variants);
        //console.log('subvariant object bby',subVariant,"obj from get function", variantObj);
        console.log('final Sub',subVariant[variantObj.id]);

        this.state.payAsYouGoProductId = subVariant[variantObj.id].discount_variant_id;
        this.state.variantPrice = +subVariant[variantObj.id].discount_variant_price;
    }

    renderOz(){
        let ozEl = document.querySelectorAll(this.selectors.productOz);
        let counter = 1;

        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        if(this.state.paymentPlan === 'prepaid'){
            ozEl.forEach(el =>{
                el.innerHTML = `${this.state.oz * counter } oz`;
                counter += 1;
            })
        } else {
            ozEl.forEach(el =>{
                console.log('price per one',this.state.pricePerOne )
                let price = (this.state.pricePerOne * 0.8 *  counter) / 100
                
                el.innerHTML = `${formatter.format(price)}/bag`;
                counter += 1;
            })
        }

        
    }

    getVariant(productVariantsArray){
        const { option1, option2 } = this.state;
        let productVariant;

        console.log('variants array',productVariantsArray)
        console.log(this.state);
        if(productVariantsArray.length === 1 ){
            productVariant = productVariantsArray[0];
        } else if(option1 != null || option2 != null){
            console.log('else if running')
            //console.log('running')
            
            let variantArray = productVariantsArray.filter(variant =>{
                let check = true;
                if(option1 != null){
                    if(!variant.options.includes(option1)){
                        check = false;
                        //console.log(variant.options.includes(option1));
                        //console.log(variant.options, option1);
                    }
                }
                if(option2 != null){
                    if(!variant.options.includes(option2)){
                        check = false;
                        //console.log(variant.options.includes(option2));
                        //console.log(variant.options, option2);
                    }
                }
                console.log(check)
                console.log(variant.options.includes(option1), variant.options.includes(option2),variant);
                return check;
            })

            

            productVariant = variantArray[0];
        }

        return productVariant
        
    }

    handleQuantitySelect(e){
        const { subscription } = this.selectors.sections;
        this.state.quantity = +e.target.value;

        if(this.state.paymentPlan === 'prepaid'){
            document.querySelector(this.selectors.prepaidLegend).style.display = 'inline';
            document.querySelector(this.selectors.frequencyLegend).style.display = 'none';
            document.querySelector(this.selectors.prepaidSubheader).style.display = 'block';
            
        }else{
            document.querySelector(this.selectors.prepaidLegend).style.display = 'none';
            document.querySelector(this.selectors.frequencyLegend).style.display = 'inline';
            document.querySelector(this.selectors.prepaidSubheader).style.display = 'none';
        }
        this.renderSubscriptionSubtitle()
        this.renderStep(this.steps.length + 1,subscription);
        this.showSection(subscription);
        this.renderReview();
        
        //console.log(this.state);
    }

    renderSubscriptionSubtitle(){
        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        let counter=1;

        let subSubtitleEl = document.querySelectorAll(this.selectors.subscriptionSubtitle);
        subSubtitleEl.forEach(item =>{
            let price = (this.state.pricePerOne * 0.8 * counter)/100;
            item.innerHTML = `${formatter.format(price)}/bag`
            counter+=1;
        })
    }

    handleSubscriptionSelect(e){
        const { review,submit } = this.selectors.sections;

        this.state.duration = +e.target.value;

        if(this.state.paymentPlan === 'prepaid'){
            this.getPrepayVariant(this.state.duration);
        }else{

        }

        //show review section
        this.renderStep(this.steps.length + 1, review)
        this.renderStep(this.steps.length + 1, submit)
        this.renderReview();
        this.showSection(review);
        this.showSection(submit, false);
    }

    scrollIntoView(querySelector){
        document.querySelector(querySelector).scrollIntoView();
    }

    renderReview(){
        const { subscription, coffee, quantity, duration, subtotal } = this.selectors.review;
        const { paymentPlan, flavorName, option1, option2, quantity:qty, duration:dur } = this.state;
        let reviewSubEl = document.querySelector(subscription);
        let reviewCoffeeEl = document.querySelector(coffee);
        let reviewQtyEl = document.querySelector(quantity);
        let durationEl = document.querySelector(duration);
        let subtotalEl = document.querySelector(subtotal);
        //inject state values into html elements

        
        if(paymentPlan === 'prepaid'){
            reviewSubEl.innerHTML = paymentPlan;
        } else{
            reviewSubEl.innerHTML = "Pay as you go";
        }

        //coffee input code
        let option1Val = option1 ? `${option1}/` : '';
        let option2Val = option2 ? `${option2}/` : '';
        reviewCoffeeEl.innerHTML = `${flavorName}/${option1Val}${option2Val}`;

        //quantity text
        let bagsText = qty > 1? 'BAGS': 'BAG';
        reviewQtyEl.innerHTML = `${qty} ${bagsText}`;

        //Duration Text 
        durationEl.innerHTML = `${dur} MONTHS`;

        //update subtotal
        if(this.state.paymentPlan === "prepaid"){
            this.state.subtotal = (this.state.variantPrice * this.state.quantity) / 100;
        } else{
            this.state.subtotal = (this.state.variantPrice * this.state.quantity);
        }
        
        console.log('subtotal',this.state.variantPrice,this.state.quantity,this.state.subtotal)
        // Create our number formatter.
        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
  
  

        subtotalEl.innerHTML = formatter.format(this.state.subtotal);
    }

    handleTextAreaChange(e){
        this.state.msgText = e.target.value;
    }


    addToCart(e){
        e.preventDefault();
        if(this.state.paymentPlan === 'prepaid'){
            this.handlePrepaidAddToCart();
        } else{
            this.handleSubscriptionAddToCart();
        }
    }

    handlePrepaidAddToCart(){
        const url = '/cart/add.js';

        let variantID = this.state.prepaidProductId;
        let data = {
            id:variantID,
            quantity:this.state.quantity,
            note: this.state.msgText
        }


        let params = {
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(data)
        }

        console.log(data);

        fetch(url, params).then( data =>{
            console.log(data);
        })
    }

    handleSubscriptionAddToCart(){
        const url = '/cart/add.js';

        let variantID = this.state.payAsYouGoProductId;
        let data = {
            id:variantID,
            quantity:this.state.quantity,
            "properties": {
                "shipping_interval_frequency": this.state.duration,
                "shipping_interval_unit_type": "Months"
            },
            note: this.state.msgText
        }


        let params = {
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(data)
        }

        console.log(data);

        fetch(url, params).then( data =>{
            console.log(data);
        })
    }
}

