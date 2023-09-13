#!/usr/bin/bash

for grado in {3..11} 
do
    for cuadernillo in {1,2} 
    do
        curl https://s3.amazonaws.com/pruelec-2017/EvaluarParaAvanzar/Cuadernillos/Hoja_de_Respuestas_Cuadernillo-Matematicas-${grado}-${cuadernillo}.pdf --output Hoja_de_Respuestas_Cuadernillo-Matematicas-${grado}-${cuadernillo}.pdf;
    done
done
