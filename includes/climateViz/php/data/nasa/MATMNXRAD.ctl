dset ^MATMNXRAD/%y4/%ch.prod.assim.tavgM_2d_rad_Nx.%y4%m2.hdf
title tavgM_2d_rad_Nx: MERRA 2D IAU Diagnostic, Radiation Surface and TOA, Monthly Mean (2/3x1/2L1)
CHSUB 1 1 MERRA101
CHSUB 2 156 
CHSUB 157 163 MERRA101
CHSUB 164 165 
CHSUB 166 168 MERRA101
CHSUB 169 180 MERRA201
CHSUB 181 264 
CHSUB 265 265 MERRA301
CHSUB 266 396 
OPTIONS template
undef 1e+15
dtype hdfsds
xdef 540 linear -180 0.66666666666
ydef 361 linear -90 0.5
zdef 1 linear 1 1
tdef 24 linear 00Z01JAN1979 1mo
vars 36
EMIS=>emis 0 t,y,x Surface emissivity
TS=>ts 0 t,y,x Surface skin temperature
ALBEDO=>albedo 0 t,y,x Surface albedo
ALBNIRDF=>albnirdf 0 t,y,x Diffuse beam NIR surface albedo
ALBNIRDR=>albnirdr 0 t,y,x Direct beam NIR surface albedo
ALBVISDF=>albvisdf 0 t,y,x Diffuse beam VIS-UV surface albedo
ALBVISDR=>albvisdr 0 t,y,x Direct beam VIS-UV surface albedo
LWGEM=>lwgem 0 t,y,x Emitted longwave at the surface
LWGAB=>lwgab 0 t,y,x Absorbed longwave at the surface
LWGABCLR=>lwgabclr 0 t,y,x Absorbed longwave at the surface with no cloud
LWGABCLR=>lwgabclrcln 0 t,y,x Absorbed longwave at the surface with no cloud or aerosol
LWGNT=>lwgnt 0 t,y,x Net downward longwave flux at the surface
LWGNTCLR=>lwgntclr 0 t,y,x Net downward longwave flux at the surface for cloud-free sky
LWGNTCLRCLN=>lwgntclrcln 0 t,y,x Net downward longwave flux at the surface for clear sky
LWTUP=>lwtup 0 t,y,x Upward longwave flux at top of atmosphere (TOA)
LWTUPCLR=>lwtupclr 0 t,y,x Upward longwave flux at TOA assuming clear sky
LWTUPCLRCLN=>lwtupclrcln 0 t,y,x Upward longwave flux at TOA assuming clear clean sky
SWTDN=>swtdn 0 t,y,x TOA incident shortwave flux
SWGDN=>swgdn 0 t,y,x Surface incident shortwave flux
SWGDNCLR=>swgdnclr 0 t,y,x Surface incident shortwave flux assuming clear sky
SWGNT=>swgnt 0 t,y,x Surface net downward shortwave flux
SWGNTCLR=>swgntclr 0 t,y,x Surface net downward shortwave flux assuming clear sky
SWGNTCLN=>swgntcln 0 t,y,x Surface net downward shortwave flux assuming clean sky
SWGNTCLRCLN=>swgntclrcln 0 t,y,x Surface net downward shortwave flux assuming clear clean sky
SWTNT=>swtnt 0 t,y,x TOA outgoing shortwave flux
SWTNTCLR=>swtntclr 0 t,y,x TOA outgoing shortwave flux assuming clear sky
SWTNTCLN=>swtntcln 0 t,y,x TOA outgoing shortwave flux assuming clean sky
SWTNTCLRCLN=>swtntclrcln 0 t,y,x TOA outgoing shortwave flux assuming clear clean sky
TAUHGH=>tauhgh 0 t,y,x Optical thickness of high clouds
TAULOW=>taulow 0 t,y,x Optical thickness of low clouds
TAUMID=>taumid 0 t,y,x Optical thickness of mid-level clouds
TAUTOT=>tautot 0 t,y,x Optical thickness of all clouds
CLDHGH=>cldhgh 0 t,y,x High-level (above 400 hPa) cloud fraction
CLDLOW=>cldlow 0 t,y,x Low-level (1000-700 hPa) cloud fraction
CLDMID=>cldmid 0 t,y,x Mid-level (700-400 hPa) cloud fraction
CLDTOT=>cldtot 0 t,y,x Total cloud fraction
endvars
* period month
* timestart jan1979
* timeend jan2001
* open open