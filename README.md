# Fix It 
## AI-Powered Study Assistant 🌍 Web Application 

### Overview
Fix It is an AI-driven application designed to help students improve their learning by focusing on their weak areas. The application generates quizzes based on uploaded study materials and provides detailed feedback to enhance understanding.

### How It Works
1. **Upload Study Materials**: Students upload their learning materials in PDF format.
2. **AI Processing**: The application processes the uploaded document and extracts key information.
3. **Quiz Generation**: AI generates quizzes based on the content of the PDF.
4. **Performance Analysis**: The student's answers are evaluated to identify weak areas.
5. **Detailed Feedback & Study Topics**: The application provides detailed explanations and additional resources based on incorrect answers to help students strengthen their understanding.

### Features
- **User Authentication**: Secure login and sign-up using JWT authentication.
- **PDF Processing**: AI extracts and structures the content from the uploaded PDF.
- **AI-Powered Quiz Generation**: Generates quizzes based on the study material.
- **Adaptive Learning**: Identifies weak areas and provides additional study topics beyond the uploaded material.
- **Persistent Storage**: All data is stored in a database, ensuring accessibility at any time.

### Running the Application
Since Fix It uses Docker, no manual dependency installation is required. Follow these steps to run the application:

1. **Clone the repository**:
    Navigate to your preferred directory, open the terminal, and type the following:
    ```bash
    git clone https://github.com/chera-mihiretu/Fix-IT.git
    ```

2. **Navigate to the backend directory**:
    After cloning the application, navigate to the backend directory:
    ```bash
    cd [AppDir]/backend # replace [AppDir] with the application directory
    ```

3. **Build and start the application**:
    To build and run the application, execute the following command:
    ```bash
    docker-compose up --build
    ```

Once the setup is complete, the application will be up and running, ready to assist students in their studies! 🚀
