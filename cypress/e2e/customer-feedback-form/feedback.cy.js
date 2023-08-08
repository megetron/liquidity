/// <reference types="cypress" />

context('Customer Feedback', () => {
    beforeEach(() => {
      cy.visit(Cypress.env('customer_feedback_url'));
    })
    
    it('verify initial components state', () => {
      cy.get('#mat-input-1').should('be.disabled')
      cy.get('#comment').should('not.be.disabled');
      cy.get('#captchaControl').should('not.be.disabled');
      cy.get('#rating').should('have.attr',"aria-valuenow","0")
      cy.get('#submitButton').should('be.disabled');
    })

    it('should display client error message when message is empty', () => {
      cy.get('#comment').focus().blur().should('have.class', 'ng-invalid');
      cy.get('mat-error').contains('Please provide a comment.');
    })

    it('should display client error message when captach is not a number', () => {
      const invalid_captcha = "not a number"
      cy.get('#captchaControl')
        .type("not a number", {force: true}).blur({force: true})
        .should('have.value', invalid_captcha)
        .should('have.class', 'ng-invalid')

      cy.get('mat-error').contains('Invalid CAPTCHA code');    
    })

    it('should be submitted successfully when captcha resolved correctly', () => {
      const message = "Message"
      cy.resolveCaptcha().then((result) => {

        cy.intercept('POST', '**/Feedbacks/').as('createFeedback')

        cy.fillFeedbackForm(message, result, 1);
        cy.contains("Thank you for your feedback.");

        cy.wait('@createFeedback').then((interception) => {
          cy.expectRequestToSucceed(interception, result, `${message} (anonymous)`, 2);
        });
      })
    });
    
    it('should fail to submit when captcha not resolved correctly', () => {
      const message = "Message"
      const captcha = 1234567890;
      
      cy.intercept('POST', '**/Feedbacks/').as('createFeedback');
      cy.fillFeedbackForm(message, captcha , 1);
      cy.contains("Wrong answer to CAPTCHA. Please try again.");
      cy.wait('@createFeedback').then((interception) => {
        cy.expectRequestToFail(interception, `${message} (anonymous)`, 2, captcha);
      });
    })
  })
