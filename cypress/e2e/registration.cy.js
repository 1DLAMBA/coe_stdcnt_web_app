describe('Registration', () => {
  beforeEach(() => {
    cy.intercept(/127\.0\.0\.1:8000\/api\//, (req) => {
      const allowed = [
        '/api/check',
        '/api/personal-details',
        '/api/student-details',
        '/api/educational-details',
        '/api/course-data',
        '/api/upload',
        '/api/file/get',
      ];
      const isAllowed = allowed.some((p) => req.url.includes(p));
      if (!isAllowed) {
        throw new Error(`Unstubbed request to local backend: ${req.method} ${req.url}`);
      }
    });

    cy.intercept({ method: 'POST', pathname: '/api/check' }, {
      statusCode: 404,
      body: { message: 'Student not found' },
    }).as('userCheck');

    cy.intercept({ method: 'POST', pathname: '/api/personal-details' }, {
      statusCode: 201,
      body: { id: 9999, application_number: 'COE-CY-9999' },
    }).as('createPersonal');

    cy.intercept({ method: 'POST', pathname: '/api/student-details' }, {
      statusCode: 201,
      body: { id: 1 },
    }).as('createStudent');

    cy.intercept({ method: 'POST', pathname: '/api/educational-details' }, {
      statusCode: 201,
      body: { id: 1 },
    }).as('createEducational');

    cy.intercept('GET', 'https://nga-states-lga.onrender.com/fetch').as('statesApi');
    cy.intercept('GET', 'https://nga-states-lga.onrender.com/?state=*').as('lgaApi');

    cy.intercept({ method: 'GET', pathname: '/api/course-data' }, {
      statusCode: 200,
      body: [
        { id: 1, course: 'Mathematics' },
        { id: 2, course: 'English Language' },
        { id: 3, course: 'Physics' },
        { id: 4, course: 'Chemistry' },
        { id: 5, course: 'Biology' },
        { id: 6, course: 'Economics' },
        { id: 7, course: 'Geography' },
      ],
    }).as('courseDataApi');
  });

  it('walks an applicant with a unique phone/email through to Pay Now', () => {
    cy.uniqueUser().then((u) => {
      cy.visit('/registration');

      cy.wait('@statesApi', { timeout: 30000 });
      cy.wait('@courseDataApi', { timeout: 30000 });

      cy.get('#surname').type('Cypress');
      cy.get('#other_names').type(`Tester${u.ts}`);
      cy.selectByName('marital_status', 'Single');
      cy.pickDateByName('date_of_birth', '2000-01-15');
      cy.get('#address').type('1 Test Lane, Minna');

      cy.selectByName('state_of_origin', 'Niger');
      cy.wait('@lgaApi', { timeout: 30000 });
      cy.selectByNameAt('local_government', 0);

      cy.get('#ethnic_group').type('Nupe');
      cy.get('#religion').type('Islam');
      cy.get('#phone_number').type(u.phone);
      cy.get('#email').type(u.email);

      cy.get('#name_of_father').type('John Doe');
      cy.get('#father_state_of_origin').type('Niger');
      cy.get('#father_place_of_birth').type('Bida');
      cy.get('#mother_place_of_birth').type('Minna');
      cy.get('#mother_state_of_origin').type('Niger');

      cy.get('#applicant_occupation').type('Student');
      cy.get('#working_experience').type('1 year');
      cy.selectByName('desired_study_cent', 'Bida');

      cy.proceedTo('School and Course Selection');

      cy.get('#p_school_name_1').type('LEA Primary Bida');
      cy.pickDateByName('p_school_from_1', '2005-09-01');
      cy.pickDateByName('p_school_to_1', '2011-07-31');

      cy.get('#s_school_name_1').type('Government Secondary School Bida');
      cy.pickDateByName('s_school_from_1', '2011-09-01');
      cy.pickDateByName('s_school_to_1', '2017-07-31');

      cy.selectByName('first_school', 'School of Sciences');
      cy.selectByName('first_course', 'Maths / Computer Science');

      cy.selectByName('second_school', 'School of Education');
      cy.selectByName('second_course', 'Primary Education Studies (Double Major)');

      cy.proceedTo('Examination Details Form');

      cy.selectByName('exam_type', 'WAEC');
      cy.get('#exam_number').type('1234567890');
      cy.selectByName('exam_month', 'May/Jun');
      cy.get('#exam_year').type('2018');

      const subjects = [
        'Mathematics',
        'English Language',
        'Physics',
        'Chemistry',
        'Biology',
      ];
      for (let i = 1; i <= 5; i++) {
        cy.selectByName(`subject_${i}`, subjects[i - 1]);
        cy.selectByName(`grade_${i}`, 'B2');
      }

      cy.contains('button', 'Proceed').click({ force: true });

      cy.wait('@userCheck', { timeout: 15000 });

      cy.contains('Complete Your Application', { timeout: 15000 }).should('be.visible');
      cy.contains('button', 'Pay Now').should('be.visible');
    });
  });

  it('renders the success page for a completed registration', () => {
    cy.intercept('GET', '**/api/personal-details/9999', {
      statusCode: 200,
      body: {
        passport: 'demo.jpg',
        application_number: 'COE-CY-9999',
        application_reference: 'cy_ref_9999',
        surname: 'Cypress',
        other_names: 'Tester',
        date_of_birth: '2000-01-15',
        phone_number: '08000000000',
        marital_status: 'single',
        address: '1 Test Lane',
        state_of_origin: 'Niger',
        local_government: 'Bosso',
        first_school: 'School of Sciences',
        first_course: 'Maths / Computer Science',
        second_school: 'School of Education',
        second_course: 'Primary Education Studies (Double Major)',
        religion: 'Islam',
        desired_study_cent: 'Bida',
      },
    }).as('successPersonal');
    cy.intercept('GET', '**/api/student-details/9999', {
      statusCode: 200,
      body: {},
    }).as('successSchool');

    cy.visit('/registration/9999/success');

    cy.wait('@successPersonal');
    cy.contains('Cypress', { timeout: 15000 }).should('be.visible');
  });
});
