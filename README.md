# CodeVault - README

![cCode Vault Image](https://github.com/jae-sd/hackathon/raw/main/public/img/readme.png)

## Team Name: Infinite Loop

### Table of Contents

1. [Introduction](#introduction)
2. [Project Description](#project-description)
3. [Features](#features)
4. [How it Works](#how-it-works)
5. [Inspiration](#inspiration)
6. [Usage](#usage)
7. [Installation](#installation)
8. [Import Request Collection](Importing Request Collection into Insomnia)
9. [Environment Variables](#environment-variables)
10. [Support](#support)
11. [Contributing](#contributing)
12. [License](#license)

## Introduction

Welcome to CodeVault, a revolutionary platform for student freelancers to securely sell their source code to their peers. The app allows users to upload their projects in a zip format, which is then protected by a unique password. This ensures that the source code remains exclusive to the purchaser, preventing unauthorized sharing and maintaining the value of your hard work. Whether you're a student freelancer or someone in need of a quality project, CodeVault is your one-stop solution!

## Project Description

CodeVault is designed to address the challenges faced by student freelancers like us. We often create unique and valuable projects for our fellow students, but protecting the source code and ensuring fair compensation can be challenging. With CodeVault, we have created a simplified version of Patreon, focused on secure distribution and accessibility for both sellers and buyers.

## Features

- **Secure File Protection:** CodeVault employs state-of-the-art encryption to protect the source code files within the zip, ensuring only the buyer can access them with the unique password.
- **Effortless Uploads:** As a seller, you can easily upload your project as a zip file, and the platform takes care of the rest, adding the necessary password protection.
- **Password Generation:** The platform generates strong passwords for each uploaded project, ensuring enhanced security.
- **Seamless Transactions:** CodeVault handles the transactions between the sellers and buyers securely, making it easy for everyone to participate.
- **User-Friendly Interface:** The app offers an intuitive and easy-to-navigate interface, allowing users to browse, search, and purchase projects effortlessly.
- **Support for Multiple Formats:** CodeVault supports various programming languages and project types, making it a versatile marketplace for students.

## How it Works

1. **Seller Uploads Project:** As a seller, you can upload your project in zip format through your CodeVault account.
2. **Password Generation:** CodeVault automatically generates a unique password for the zip file, ensuring security.
3. **Listing on CodeVault:** Your project is listed on CodeVault, accessible to potential buyers.
4. **Buyer Purchases Project:** Buyers can explore the available projects, make a purchase, and download the zip file with the secure password.
5. **Secure Access:** The buyer can access and use the source code, while the encryption ensures it remains protected.

## Inspiration

Imagine a world where student freelancers can easily share their hard work without worrying about unauthorized distribution. As student freelancers ourselves, we understand the struggle of creating projects and wanting to sell them while protecting our intellectual property. The inspiration behind CodeVault stems from our desire to create a simpler version of Patreon, exclusively tailored to address the needs of student developers.

Our passion for coding and the pursuit of a fair and secure marketplace for student freelancers led us to conceptualize CodeVault. We want to empower fellow students to showcase their talent, earn a fair income, and contribute to the academic community. By ensuring their work remains protected, we aim to foster a culture of respect for intellectual property among students.

With CodeVault, we envision a future where student freelancers can focus on honing their skills and creating innovative projects, knowing that their hard work is valued and protected.

 Usage
To start using CodeVault, please follow these steps:

1. Sign up for an account.
2. As a seller, upload your projects in zip format.
3. As a buyer, explore the available projects and purchase the ones you find interesting.
4. After purchase, you'll receive the zip file with the encrypted password to access the source code.

## Installation

To set up the project locally for development, follow these steps:

1. Clone the GitHub repository: `git clone https://github.com/jae-sd/hackathon`
2. Navigate to the project folder.
3. Install the required Node.js dependencies: `npm install`
4. Start the development server: `npm run dev`

You are now ready to work on the CodeVault project locally. Happy coding!

## Request Collection into Insomnia

To get started with the hackathon, follow these steps to import the request collection into Insomnia:

1. Make sure you have [Insomnia](https://insomnia.rest/) installed on your machine.
2. Locate the request collection file in the Insomnia directory. It should be located in the root folder of your project.
3. Copy the request collection file (usually with a `.json` extension) from the Insomnia directory.
4. Open Insomnia on your machine.
5. In Insomnia, go to `File` > `Import Data` > `From File...`.
6. Choose the copied request collection file from the Insomnia directory.
7. Insomnia will import the request collection and display it in the workspace.
8. You can now explore the imported request collection, make requests, and test your hackathon project using Insomnia.

Please note that the above instructions assume you have the request collection file ready in the Insomnia directory. Make sure to follow any additional project-specific instructions provided by your hackathon organizers.

If you encounter any issues or need further assistance, feel free to reach out for support. Good luck with your hackathon!

## Environment Variables

Make sure to set up the following environment variables for CodeVault to work correctly:

##### MongoDB Database Config

[MongoDB Compass Download URL](https://www.mongodb.com/try/download/compass)

- MONGODB_COMPASS_URL= `<your_mongodb_compass_url>`

[MongoDB Atlas URL](https://cloud.mongodb.com/v2/632f587e3301614db483ba98#/clusters)

- MONGODB_ATLAS_URL= `<your_mongodb_atlas_url>`

##### Treblle Config

[Treblle API Key](https://app.treblle.com/users/profile)

- TREBLLE_API_KEY= `<your_treblle_api_key>`
- TREBLLE_PROJECT_ID= `<your_treblle_project_id>`

##### JWT Secret

- ACCESS_TOKEN_SECRET= `<your_access_token_secret>`

##### License Secret

- LICENSE_SECRET= `<your_license_secret>`

##### ConvertApi Config

[ConvertApi Authentication](https://www.convertapi.com/cara-a/auth)

- CONVERT_API_KEY= `<your_convert_api_key>`
- CONVERT_API_SECRET= `<your_convert_api_secret>`

##### Paystack Config

[Paystack Dashboard](https://dashboard.paystack.com/#/settings/developers)

- PAYSTACK_SECRET_KEY= `<your_paystack_secret_key>`
- PAYSTACK_PUBLIC_KEY= `<your_paystack_public_key>`

Please ensure that you obtain the necessary credentials and replace the placeholders with your actual values for these environment variables.

## Support

If you encounter any issues or have questions, please reach out to our support team at support@codevault.com. We are available 24/7 to assist you.

## Contributing

We believe in the power of collaboration and welcome contributions from the community. If you have any ideas or want to contribute to the development of CodeVault, please check out our [Contribution Guidelines](link_to_contribution_guidelines.md).

## License

CodeVault is licensed under the [MIT License](link_to_license.md). Feel free to use, modify, and distribute it according to the terms of the license.

---

Thank you for considering CodeVault for the hackathon! We are excited about the potential impact this project can have on student freelancers and the academic community. With our focus on secure file protection and user-friendly features, we believe CodeVault stands out as a valuable solution for creators and buyers alike. We look forward to showcasing our project and demonstrating how CodeVault can transform the way students buy and sell their source code securely.

Best regards,
Infinite Loop Team
