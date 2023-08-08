// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.env({
    customer_feedback_url: 'https://juice-shop.herokuapp.com/#/contact',
  })


Cypress.Commands.add('fillFeedbackForm', (message, captcha, rating=1) => {
    expect(captcha).to.be.a('number');

    cy.get('#comment').type(message, {force: true}).should('have.value', message);
    cy.get('#captchaControl').type(captcha, {force: true}).should('have.value', captcha);    
    cy.get('#rating').focus().type("{rightarrow}".repeat(rating));
    cy.get('#submitButton').should('not.be.disabled').click({force: true});
})

Cypress.Commands.add('getCaptchaText', () => {
    return cy.get('#captcha')
      .invoke('text')
      .then((captchText) => {
        return captchText;
      });
  });

  Cypress.Commands.add('resolveCaptcha', () => {
    return cy.get('#captcha')
      .invoke('text')
      .then((captchText) => {
        try {
          const modifiedExpression = captchText;
          const result = eval(modifiedExpression);

          return result;
        } catch (error) {
          cy.log(`Error evaluating expression: ${expression}`);
          return null;
        }
      });
  });
  

  Cypress.Commands.add('expectRequestToSucceed', (interception, result, expectedComment, expectedRating) => {
    const requestBody = interception.request.body;
  
    expect(requestBody.captcha).to.equal(result.toString());
    expect(requestBody.comment).to.equal(expectedComment);
    expect(requestBody.rating).to.equal(expectedRating);
  
    expect(interception.response.statusCode).to.equal(201);
    expect(interception.response.body.status).to.equal('success');
  
    const responseBody = interception.response.body;
    expect(responseBody.data.rating).to.equal(expectedRating);
    expect(responseBody.data.comment).to.equal(expectedComment);
    expect(responseBody.data.UserId).to.equal(null);
  });
  
  Cypress.Commands.add('expectRequestToFail', (interception, expectedComment, expectedRating, captcha) => {
    const requestBody = interception.request.body;
  
    expect(requestBody.captcha).to.equal(String(captcha));
    expect(requestBody.comment).to.equal(expectedComment);
    expect(requestBody.rating).to.equal(expectedRating);
  
    expect(interception.response.statusCode).to.equal(401);
    expect(interception.response.body).to.equal('Wrong answer to CAPTCHA. Please try again.');
  });
  