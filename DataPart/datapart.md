Access this sheet for Data:
https://www.notion.so/Project-Data-23f3a78e0e2280ef9a95fb1004e5ecb8?source=copy_link


{
    "title": "Addition of Two Numbers",
    "description": "Write a program that takes two integers as input and returns their sum.",
    "difficulty": "easy",
    "tags": "array",
    "visibleTestCases": [
        {
            "input": "2 3",
            "output": "5",
            "explanation": "2 + 3 equals 5"
        },
        {
            "input": "-1 5",
            "output": "4",
            "explanation": "-1 + 5 equals 4"
        }
    ],
    "hiddenTestCases": [
        {
            "input": "10 20",
            "output": "30"
        },
        {
            "input": "100 250",
            "output": "350"
        }
    ],
    "startCode": [
        {
            "language": "C++",
            "initialCode": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    // Read input here\n    cout << a + b;\n    return 0;\n}"
        },
        {
            "language": "Java",
            "initialCode": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Read input here\n    }\n}"
        },
        {
            "language": "JavaScript",
            "initialCode": "const readline = require('readline');\n\n// Complete input handling here"
        }
    ],
    "referenceSolution": [
        {
            "language": "C++",
            "completeCode": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}"
        },
        {
            "language": "Java",
            "completeCode": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}"
        },
        {
            "language": "JavaScript",
            "completeCode": "const input = require('fs').readFileSync(0, 'utf-8').trim();\nconst [a, b] = input.split(' ').map(Number);\nconsole.log(a + b);"
        }
    ]
}












Create New Problem
Basic Information
Title
Find the Factorial
Description
"Write a program that takes a non-negative integer 'n' and returns its factorial. The factorial of n (n!) is the product of all positive integers less than or equal to n.",
Difficulty

Hard
Tag

DP
Test Cases
Visible Test Cases
"input": "5",
"output": "120",
"explanation": "5! = 5 * 4 * 3 * 2 * 1 = 120"
"input": "0",
"output": "1",
"explanation": "The factorial of 0 is defined as 1."
Hidden Test Cases
"input": "3",
"output": "6"
"input": "10",
"output": "3628800"
Code Templates
C++
Initial Code
{
             #include <iostream>
              using namespace std;
              int main(){   int n;    
               return 0;}"
        }
Reference Solution
"#include <iostream>
#include <climits>
using namespace std;
int main(){   int n;   
if (!(cin >> n)) return 0;
    int maxVal = INT_MIN;
 for(int i = 0; i < n; i++) {        int current;\n        cin >> current;       if(current > maxVal) { maxVal = current;        }    }   cout << maxVal;   return 0;}"
Java
Initial Code
import java.util.Scanner;
public class Main {    public static void main(String[] args) {           }}"
            "completeCode": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n; cin >> n;\n    long long fact = 1;\n    for(int i = 1; i <= n; i++) fa
Reference Solution
import java.util.Scanner;
public class Main {   public static void main(String[]args) {          }}"
JavaScript
Initial Code
const fs = require('fs');function solve() {    const input = fs.readFileSync(0, 'utf8').trim();
   if (input === \"\") return;   const n = parseInt(input);
    let fact = 1n;     for (let i = 1; i <= n; i++) {        fact *= BigInt(i);  }   console.log(fact.toString());solve();"

Reference Solution
14"


nitish@gmail.com //Admin
Nitish@bhai@123

Golu@gmail.com //normal user
Golu@bhai@123