# HTS_Module
## Description
- The PMTCT module handles the management and tracking of HIV testing services
  
## System Requirements

### Prerequisites to Install
- IDE of choice (IntelliJ, Eclipse, etc.)
- Java 8+
- node.js
- React.js
## Run in Development Environment

### How to Install Dependencies
1. Install Java 8+
2. Install PostgreSQL 14+
3. Install node.js
4. Install React.js
5. Open the project in your IDE of choice.

### Update Configuration File
1. Update other Maven application properties as required.

### Run Build and Install Commands
1. Change the directory to `src`:
    ```bash
    cd src
    ```
2. Run Frontend Build Command:
    ```bash
    npm run build
    ```
3. Run Maven clean install:
    ```bash
    mvn clean install
    ```

## How to Package for Production Environment
1. Run Maven package command:
    ```bash
    mvn clean package
    ```

## Launch Packaged JAR File
1. Launch the JAR file:
    ```bash
    java -jar <path-to-jar-file>
    ```
2. Optionally, run with memory allocation:
    ```bash
    java -jar -Xms4096M -Xmx6144M <path-to-jar-file>
    ```

## Visit the Application
- Visit the application on a browser at the configured port:
    ```
    http://localhost:8383
    ```

## Access Swagger Documentation
- Visit the application at:
    ```
    http://localhost:8383/swagger-ui.html#/
    ```

## Access Application Logs
- Application logs can be accessed in the `application-debug` folder.

## Authors & Acknowledgments
### Main contributors
- Victor Ajor   https://github.com/AJ-DataFI
- Mathew Adegbite https://github.com/mathewade
- Emeka https://github.com/drjavanew
- Ganiyat Yakub   https://github.com/Ganiyatyakub
- Abisayo Peter Abiodun https://github.com/Asquarep
- Tyav Barnabas https://github.com/tyavbarnabas
## Special mentions.
- mechack2022 https://github.com/mechack2022
- Aderoju Israel https://github.com/yinkyAde
- Hafiz Mohammad Danmanu https://github.com/Danmanu44
- Aniwange Tertese Amos https://github.com/aniwange33
- Dikum https://github.com/dikumheartland
