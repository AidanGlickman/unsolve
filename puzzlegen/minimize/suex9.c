 /* randomly reduces the clues in a sudoku to make it locally minimal */
//  source http://magictour.free.fr/sudoku.htm
#include <stdlib.h>
#include <stdio.h>
#define N 3
#define N2 N*N
#define N4 N2*N2
#define MWC (   (zr=36969*(zr&65535)+(zr>>16)) ^ (wr=18000*(wr&65535)+(wr>>16))  )
unsigned zr=362436069, wr=521288629;

int Rows[4*N4+9],Cols[N2*N4+9],Row[4*N4+9][N2+1],Col[N2*N4+9][5];
int Ur[N2*N4+9],Uc[4*N4+9],V[4*N4+9];
int P[N4+9],A[N4+9],C[N4+9],I[N4+9],S[N4+9];
int sd,smax,s1,m0,c1,c2,r1,l,i1,m1,m2,a,p,i,j,k,r,c,d,n=N2*N4,m=4*N4,x,y,s;
int nodes,seed,solutions,min,clues;
char L[17]=".123456789ABCDEFG";
FILE *file;
int solve(int);
void print_board();
void print_cdf();


int main(int argc,char*argv[]){
  if(argc<2){printf("\nusage:suex9- file [seed] \n\n    deletes non-necessary clues from the sudokus in file\n\n");
      printf("so it generates minimal sudokus with the same solution\n");
      printf("specify seed, if you want different streams of minimal sudokus (default:seed=0)\n");
      printf("puzzles in file without unique solution are ignored\n\n");
      printf("if seed<0 then the sudokus are printed in long, human-readable format\n\n");
      exit(1);}
  seed=0;if(argc>2)sscanf(argv[2],"%i",&seed);
    sd=0;if(seed<0){sd=1;seed=-seed;}zr^=seed;wr+=seed;

k=N;r=0;for(x=1;x<=N2;x++)for(y=1;y<=N2;y++)for(s=1;s<=N2;s++){
r++;Cols[r]=4;Col[r][1]=x*N2-N2+y;Col[r][2]=(k*((x-1)/k)+(y-1)/k)*N2+s+N4;
Col[r][3]=x*N2-N2+s+N4*2;Col[r][4]=y*N2-N2+s+N4*3;}
for(c=1;c<=m;c++)Rows[c]=0;
for(r=1;r<=n;r++)for(c=1;c<=Cols[r];c++){
a=Col[r][c];Rows[a]++;Row[a][Rows[a]]=r;}

if((file=fopen(argv[1],"rt"))==NULL)
  {fclose(file);printf("\nfile-error\n\n");exit(1);}


m0:for(i=1;i<=81;i++){
mip:A[i]=fgetc(file)-48;if(feof(file))exit(8);
    if(A[i]==-2)A[i]=0;
    if(A[i]>9)A[i]-=7;if(A[i]<0)goto mip;}

if(solve(2)!=1)goto m0;

mh7:for(i=1;i<=N4;i++){mr4:x=MWC&127;if(x>=i)goto mr4;x++;P[i]=P[x];P[x]=i;}
for(i1=1;i1<=N4;i1++)if(A[P[i1]]){s1=A[P[i1]];
   A[P[i1]]=0;if(solve(2)>1)A[P[i1]]=s1;}

if(sd)print_board();
if(!sd){for(i=1;i<=N4;i++)printf("%c",L[A[i]]);printf("\n");}
goto m0;return 0;}



int solve(smax){

s0:for(i=0;i<=n;i++)Ur[i]=0;for(i=0;i<=m;i++)Uc[i]=0;
   clues=0;for(i=1;i<=N4;i++)
     if(A[i]){clues++;r=i*N2-N2+A[i];
       for(j=1;j<=Cols[r];j++){d=Col[r][j];if(Uc[d])return -1;Uc[d]++;
         for(k=1;k<=Rows[d];k++){Ur[Row[d][k]]++;}}}
   for(c=1;c<=m;c++){V[c]=0;for(r=1;r<=Rows[c];r++)if(Ur[Row[c][r]]==0)V[c]++;}
if(clues==N4)return 1;

   i=clues;m0=0;m1=0;solutions=0;nodes=0;
m2:i++;I[i]=0;min=n+1;if(i>N4 || m0)goto m4;
   if(m1){C[i]=m1;goto m3;}
   for(c=1;c<=m;c++)if(!Uc[c]){if(V[c]<=min)c1=c;
     if(V[c]<min){min=V[c];C[i]=c;if(min<2)goto m3;}}
   if(min>2)goto m3;

mr5:c1=MWC&511;if(c1>=m)goto mr5;c1++;
   for(c=c1;c<=m;c++)if(!Uc[c])if(V[c]==2){C[i]=c;goto m3;}
   for(c=1;c<c1;c++)if(!Uc[c])if(V[c]==2){C[i]=c;goto m3;}

m3:c=C[i];I[i]++;if(I[i]>Rows[c])goto m4;
   r=Row[c][I[i]];if(Ur[r])goto m3;m0=0;m1=0;
   for(j=1;j<=Cols[r];j++){c1=Col[r][j];Uc[c1]++;}
   for(j=1;j<=Cols[r];j++){c1=Col[r][j];
      for(k=1;k<=Rows[c1];k++){r1=Row[c1][k];Ur[r1]++;if(Ur[r1]==1)
         for(l=1;l<=Cols[r1];l++){c2=Col[r1][l];V[c2]--;
            if(Uc[c2]+V[c2]<1)m0=c2;if(Uc[c2]==0 && V[c2]<2)m1=c2;}}}
   if(i==N4)solutions++;if(solutions>smax)goto m9;goto m2;
m4:i--;c=C[i];r=Row[c][I[i]];if(i==clues)goto m9;
   for(j=1;j<=Cols[r];j++){c1=Col[r][j];Uc[c1]--;
      for(k=1;k<=Rows[c1];k++){r1=Row[c1][k];Ur[r1]--;
         if(Ur[r1]==0)for(l=1;l<=Cols[r1];l++){c2=Col[r1][l];V[c2]++;}}}
   if(i>clues)goto m3;
m9:return solutions;}



void print_board(){
int x1,x2,y1,y2;

for(y1=1;y1<=N;y1++){
   printf("+");
   for(y2=1;y2<=N;y2++)printf("%c",45);}
printf("+\n");
for(x1=1;x1<=N;x1++){
  for(x2=1;x2<=N;x2++){
    for(y1=1;y1<=N;y1++){
      printf("|");
      for(y2=1;y2<=N;y2++)printf("%c",L[A[(x1*N-N+x2-1)*N2+y1*N-N+y2]]);}
    printf("|\n");}
    for(y1=1;y1<=N;y1++){
      printf("+");
      for(y2=1;y2<=N;y2++)printf("%c",45);}
    printf("+\n");}
  printf("\n\n");
/*print_cdf();*/
}


void print_cdf(){
int x,y;
for(x=1;x<=N2;x++){
for(y=1;y<=N2;y++)printf("%2i,",A[x*N2-N2+y]);printf("\n");}
}
