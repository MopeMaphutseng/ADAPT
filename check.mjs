import {projectSchema} from './src/lib/validation.ts';
const r = projectSchema.safeParse({
  title:'Test Project', summary:'Summary here', description:'Full description here',
  status:'IDEA', technologies:['TypeScript','AI'], published:true, featured:true
});
console.log(r.success);
