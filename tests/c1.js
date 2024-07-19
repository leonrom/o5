
    class A {
        constructor(name) {
            this.nam = name
        }
        moe = ''

        print=()=> {
            console.log(this.nam, this.moe)
            }
        }
    const a1=new A('a1'),
        a2=new A('a2'),
        p2 =()=> {
            console.log('---->', a2.nam, a2.moe)
            }
        
        
    a1.nam = a1.nam + '-1.1'
    a1.moe = a1.moe + '-1.2'
    
    a2.nam = a2.nam + '-2.1'
    a2.moe = a2.moe + '-2.2'
    
    a1.print()
    a2.print()
        console.log(('---------------------------- 1'))
    a2.nam = a2.nam + '-2.3'
    a2.moe = a2.moe + '-2.4'
    
    a1.print()
    a2.print()

    console.log(('---------------------------- 2'))
    a2.print =p2

    a1.print()
    a2.print()